"""Application-only release for the existing stack; never runs CDK or migrations.
Run in AWS CloudShell. Requires boto3. No credentials or secret values are printed.
"""
import argparse, base64, copy, hashlib, json, mimetypes, os, pathlib, time, urllib.request, zipfile
import boto3
from botocore.validate import validate_parameters

REGION = 'us-east-1'
STACK = 'CraveFrameAmazon2026'
REPO = 'https://github.com/sagitta414/crave-frame/releases/download/'

def distribution_for_update(config):
    result = copy.deepcopy(config)
    # CloudFront's XML GET response can omit the empty legacy OAI field for
    # OAC-backed S3 origins. UPDATE still requires that field, even with OAC.
    for origin in result['Origins']['Items']:
        if 'S3OriginConfig' in origin and origin.get('OriginAccessControlId'):
            origin['S3OriginConfig'].setdefault('OriginAccessIdentity', '')
    return result

def report_error(error):
    print('Failure type:', type(error).__name__, flush=True)
    if isinstance(error, RuntimeError):
        print(str(error), flush=True)
    # Print schema paths only, never values (which can include origin secrets).
    if type(error).__name__ == 'ParamValidationError':
        for line in str(error).splitlines():
            if line.startswith(('Missing required parameter', 'Unknown parameter')):
                print(line, flush=True)

def require(condition, message):
    if not condition:
        raise RuntimeError(message)

def get_json(url):
    with urllib.request.urlopen(url, timeout=45) as response:
        return json.load(response)

def download(url, path, expected):
    with urllib.request.urlopen(url, timeout=90) as response, open(path, 'wb') as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)
    require(hashlib.sha256(path.read_bytes()).hexdigest() == expected, 'Release checksum mismatch')

def state_file(path, data):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as output:
        json.dump(data, output)

def check_health(origin, version):
    for attempt in range(12):
        try:
            result = get_json(origin + '/api/health')
            if result.get('status') == 'ready' and result.get('version') == version:
                return
        except Exception:
            pass
        time.sleep(5)
    raise RuntimeError('Backend health/version check failed')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--release', required=True)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--rollback', action='store_true')
    parser.add_argument('--resume', action='store_true')
    args = parser.parse_args()
    require(all(c.isalnum() or c in '-_.' for c in args.release), 'Invalid release')
    folder = pathlib.Path.home() / ('crave-release-' + args.release)
    folder.mkdir(mode=0o700, exist_ok=True)
    journal = folder / 'rollback.json'
    session = boto3.Session(region_name=REGION)
    cf, lam, edge, s3 = [session.client(x) for x in ('cloudformation','lambda','cloudfront','s3')]
    outputs = {x['OutputKey']: x['OutputValue'] for x in cf.describe_stacks(StackName=STACK)['Stacks'][0]['Outputs']}
    fn, distribution, origin = outputs['BackendFunction'], outputs['DistributionId'], outputs['Origin']
    require(origin == 'https://dcp5jtiiw3gji.cloudfront.net', 'Unexpected target site')

    def front_plan(path, marker):
        current = edge.get_distribution_config(Id=distribution)
        config = distribution_for_update(current['DistributionConfig'])
        target = next(o for o in config['Origins']['Items'] if o['Id'] == saved['origin_id'])
        require(target.get('OriginPath') in (saved['old_path'], saved['new_path']), 'Frontend changed by another deployment')
        path_changed = target.get('OriginPath') != path
        target['OriginPath'] = path
        policy = edge.get_response_headers_policy_config(Id=saved['policy_id'])
        headers = policy['ResponseHeadersPolicyConfig']['CustomHeadersConfig']['Items']
        header = next(h for h in headers if h['Header'].lower() == 'x-crave-version')
        require(header['Value'] in (saved['old_marker'], saved['version']), 'Version marker changed by another deployment')
        marker_changed = header['Value'] != marker
        header['Value'] = marker
        updates = []
        if path_changed:
            updates.append(('UpdateDistribution', 'update_distribution', dict(Id=distribution, IfMatch=current['ETag'], DistributionConfig=config)))
        if marker_changed:
            updates.append(('UpdateResponseHeadersPolicy', 'update_response_headers_policy', dict(Id=saved['policy_id'], IfMatch=policy['ETag'], ResponseHeadersPolicyConfig=policy['ResponseHeadersPolicyConfig'])))
        for operation, _, parameters in updates:
            validate_parameters(parameters, edge.meta.service_model.operation_model(operation).input_shape)
        return updates

    def switch_front(path, marker):
        updates = front_plan(path, marker)
        if not updates:
            print('Frontend already at requested release; no CloudFront update needed.', flush=True)
            return
        for operation, method, parameters in updates:
            print('Applying', operation, flush=True)
            getattr(edge, method)(**parameters)
        edge.create_invalidation(DistributionId=distribution, InvalidationBatch={'Paths':{'Quantity':1,'Items':['/*']},'CallerReference':str(time.time_ns())})
        print('Waiting for CloudFront propagation (several minutes)...', flush=True)
        edge.get_waiter('distribution_deployed').wait(Id=distribution)

    def rollback():
        current = lam.get_alias(FunctionName=fn, Name='live')
        require(current['FunctionVersion'] in (saved['old_version'], saved.get('new_version')), 'Live alias changed by another deployment')
        lam.update_alias(FunctionName=fn, Name='live', FunctionVersion=saved['old_version'], RevisionId=current['RevisionId'])
        switch_front(saved['old_path'], saved['old_marker'])
        print('Rollback complete: previous frontend and backend restored. Data and secrets untouched.')

    if args.rollback:
        saved = json.loads(journal.read_text())
        require(saved['function'] == fn and saved['distribution'] == distribution, 'Rollback target mismatch')
        rollback()
        return

    if args.resume:
        saved = json.loads(journal.read_text())
        require(saved['function'] == fn and saved['distribution'] == distribution and saved['version'] == args.release, 'Resume target mismatch')
        require(saved.get('new_version') not in (None, '$LATEST', saved['old_version']), 'No published candidate to resume')
        manifest = get_json(REPO + args.release + '/manifest.json')
        require(manifest['version'] == saved['version'], 'Manifest mismatch')
        candidate = lam.get_function_configuration(FunctionName=fn, Qualifier=saved['new_version'])
        require(candidate['CodeSha256'] == base64.b64encode(bytes.fromhex(manifest['sha256']['lambda.zip'])).decode(), 'Published candidate does not match the release archive')
        require(candidate['Environment']['Variables']['DEPLOYMENT_VERSION'] == saved['version'], 'Candidate release marker mismatch')
        archive_path = folder / 'static.zip'
        require(hashlib.sha256(archive_path.read_bytes()).hexdigest() == manifest['sha256']['static.zip'], 'Staged archive checksum mismatch')
        prefix = saved['new_path'].lstrip('/') + '/'
        staged = {item['Key']:item['Size'] for page in s3.get_paginator('list_objects_v2').paginate(Bucket=outputs['StaticBucket'],Prefix=prefix) for item in page.get('Contents',[])}
        with zipfile.ZipFile(archive_path) as archive:
            require(all(staged.get(prefix+item.filename) == item.file_size for item in archive.infolist() if not item.is_dir()), 'Staged frontend files are incomplete')
        alias = lam.get_alias(FunctionName=fn, Name='live')
        require(alias['FunctionVersion'] in (saved['old_version'], saved['new_version']), 'Another release is live; stopped')
        front_plan(saved['new_path'], saved['version'])
        print('Published candidate, staged files and CloudFront update parameters verified.', flush=True)
        if not args.apply:
            print('Resume review only. Add --apply to switch the live release.')
            return
        stage = 'switching backend alias'
        try:
            lam.update_alias(FunctionName=fn, Name='live', FunctionVersion=saved['new_version'], RevisionId=alias['RevisionId'])
            stage = 'checking backend health'
            check_health(origin, saved['version'])
            print('New backend health and version passed.', flush=True)
            stage = 'switching CloudFront'
            switch_front(saved['new_path'], saved['version'])
            stage = 'checking public release'
            verify_release(origin, saved['version'])
            print('DEPLOYED AND BASIC SMOKE CHECKS PASSED:', saved['version'], flush=True)
        except Exception as error:
            print('Failed while', stage, flush=True)
            report_error(error)
            print('Restoring previous release...', flush=True)
            rollback()
            raise
        return

    require(not journal.exists(), 'Release already started. Keep its rollback file; use --rollback if needed.')
    manifest = get_json(REPO + args.release + '/manifest.json')
    version = manifest['version']
    require(version == args.release, 'Release marker mismatch')
    alias = lam.get_alias(FunctionName=fn, Name='live')
    live = lam.get_function_configuration(FunctionName=fn, Qualifier='live')
    latest = lam.get_function_configuration(FunctionName=fn)
    require(latest['CodeSha256'] == live['CodeSha256'] and latest.get('Environment') == live.get('Environment'), 'Unpublished backend changes exist; stopped to preserve them')
    require(live['Runtime'] == 'nodejs22.x' and live['Architectures'] == ['arm64'] and live['Handler'] == 'handler.handler', 'Unexpected backend runtime')
    env = dict(live['Environment']['Variables'])
    require(all(env.get(k) for k in ('APP_SECRET_ARN','DB_HOST','RUNTIME_SECRET_ARN','EDGE_SECRET_ARN','MEDIA_BUCKET')), 'Missing existing runtime configuration')
    require(s3.get_public_access_block(Bucket=outputs['StaticBucket'])['PublicAccessBlockConfiguration']['BlockPublicPolicy'], 'Static bucket protection missing')
    check_health(origin, env['DEPLOYMENT_VERSION'])
    dist = edge.get_distribution_config(Id=distribution)['DistributionConfig']
    target_id = dist['DefaultCacheBehavior']['TargetOriginId']
    target = next(o for o in dist['Origins']['Items'] if o['Id'] == target_id)
    require('S3OriginConfig' in target and target['DomainName'].startswith(outputs['StaticBucket'] + '.'), 'Unexpected static origin')
    require(target.get('OriginPath','').startswith('/releases/'), 'Unexpected static release layout')
    policy_id = dist['DefaultCacheBehavior']['ResponseHeadersPolicyId']
    policy = edge.get_response_headers_policy_config(Id=policy_id)['ResponseHeadersPolicyConfig']
    marker = next(h['Value'] for h in policy['CustomHeadersConfig']['Items'] if h['Header'].lower() == 'x-crave-version')
    saved = {'function':fn,'distribution':distribution,'origin_id':target_id,'policy_id':policy_id,
             'old_path':target['OriginPath'],'new_path':'/releases/'+version,
             'old_marker':marker,'old_version':alias['FunctionVersion'],'version':version}
    front_plan(saved['new_path'], version)
    print('Target:', origin)
    print('Release:', version)
    print('App-only update: existing Lambda, live alias, versioned S3 assets and CloudFront release path.')
    print('No database migration, new infrastructure, secret edits, or network changes.')
    print('Costs: existing services plus release storage, requests and invalidation; no new fixed monthly service.')
    print('Known risk: TV build dependencies still have high-severity audit findings. Single NAT is not AZ-redundant.')
    print('Rollback: python3 deploy-existing.py --release ' + args.release + ' --rollback')
    if not args.apply:
        print('Review only. Re-run with --apply to deploy.')
        return

    for name in ('lambda.zip','static.zip'):
        download(REPO + args.release + '/' + name, folder / name, manifest['sha256'][name])
    with zipfile.ZipFile(folder / 'static.zip') as archive:
        names = archive.namelist()
        require(all(not n.startswith('/') and '..' not in pathlib.PurePosixPath(n).parts for n in names), 'Unsafe asset path')
        require(all(n in names for n in ('index.html','app/index.html','tv/index.html','version.json')), 'Incomplete static release')
        for name in names:
            if not name.endswith('/'):
                s3.put_object(Bucket=outputs['StaticBucket'], Key='releases/'+version+'/'+name,
                              Body=archive.read(name), ContentType=mimetypes.guess_type(name)[0] or 'application/octet-stream',
                              CacheControl='no-cache')
    print('Static assets staged; existing site still active.', flush=True)
    state_file(journal, saved)
    try:
        env['DEPLOYMENT_VERSION'] = version
        env['NODE_EXTRA_CA_CERTS'] = '/var/task/global-bundle.pem'
        lam.update_function_configuration(FunctionName=fn, Environment={'Variables':env}, RevisionId=latest['RevisionId'])
        lam.get_waiter('function_updated_v2').wait(FunctionName=fn)
        latest = lam.get_function_configuration(FunctionName=fn)
        require(latest['CodeSha256'] == live['CodeSha256'], 'Backend code changed concurrently')
        published = lam.update_function_code(FunctionName=fn, ZipFile=(folder/'lambda.zip').read_bytes(),
                                              Publish=True, RevisionId=latest['RevisionId'])
        saved['new_version'] = published['Version']
        state_file(journal, saved)
        lam.get_waiter('function_updated_v2').wait(FunctionName=fn)
        lam.update_alias(FunctionName=fn, Name='live', FunctionVersion=saved['new_version'], RevisionId=alias['RevisionId'])
        print('Checking new backend before switching frontend...', flush=True)
        check_health(origin, version)
        switch_front(saved['new_path'], version)
        verify_release(origin, version)
        print('DEPLOYED AND BASIC SMOKE CHECKS PASSED:', version)
        print('Now test Dexter search, a saved evening, and phone synchronization. Keep', journal)
    except Exception as error:
        report_error(error)
        print('Deployment failed. Attempting to restore the previous live release...', flush=True)
        rollback()
        raise

def verify_release(origin, version):
    for path in ('/','/app/','/tv/','/app/style.css'):
        with urllib.request.urlopen(origin+path, timeout=45) as response:
            require(response.status == 200, 'Document check failed')
            for name in ('Content-Security-Policy','Strict-Transport-Security','X-Frame-Options','X-Content-Type-Options','Referrer-Policy'):
                require(response.headers.get(name), 'Missing security header')
    require(get_json(origin+'/version.json')['version'] == version, 'Frontend marker mismatch')
    check_health(origin, version)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # AWS SDK errors can include request details. Do not print configuration or credentials.
        report_error(error)
        print('STOPPED. Keep the rollback file.')
        raise SystemExit(1)
