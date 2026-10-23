"""Offline AWS service-model regressions: python -m unittest discover -s aws/tests -p test_*.py"""
import contextlib
import importlib.util
import io
import pathlib
import unittest
from botocore.session import get_session
from botocore.validate import validate_parameters
from botocore.exceptions import ParamValidationError

spec = importlib.util.spec_from_file_location('deployer', pathlib.Path(__file__).parents[1] / 'scripts/deploy-existing.py')
deployer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deployer)

class CloudFrontRoundtripTests(unittest.TestCase):
    def setUp(self):
        self.shape = get_session().get_service_model('cloudfront').operation_model('UpdateDistribution').input_shape
        self.config = {'CallerReference':'test', 'Comment':'test', 'Enabled':True,
            'Origins':{'Quantity':1,'Items':[{'Id':'assets','DomainName':'private.s3.amazonaws.com',
                'OriginAccessControlId':'control', 'S3OriginConfig':{}}]},
            'DefaultCacheBehavior':{'TargetOriginId':'assets','ViewerProtocolPolicy':'redirect-to-https',
                'CachePolicyId':'test-policy'}}

    def validate(self, config):
        validate_parameters({'Id':'distribution','IfMatch':'etag','DistributionConfig':config}, self.shape)

    def test_oac_get_shape_requires_empty_legacy_field_on_update(self):
        with self.assertRaisesRegex(ParamValidationError, 'OriginAccessIdentity'):
            self.validate(self.config)
        repaired = deployer.distribution_for_update(self.config)
        self.validate(repaired)
        self.assertEqual(repaired['Origins']['Items'][0]['S3OriginConfig']['OriginAccessIdentity'], '')
        self.assertEqual(self.config['Origins']['Items'][0]['S3OriginConfig'], {})

    def test_legacy_identity_and_origin_secret_are_preserved(self):
        origin = self.config['Origins']['Items'][0]
        origin['S3OriginConfig']['OriginAccessIdentity'] = 'origin-access-identity/cloudfront/test'
        origin['CustomHeaders'] = {'Quantity':1,'Items':[{'HeaderName':'X-Origin','HeaderValue':'private-test-value'}]}
        self.assertEqual(deployer.distribution_for_update(self.config), self.config)

    def test_missing_identity_without_oac_remains_invalid(self):
        del self.config['Origins']['Items'][0]['OriginAccessControlId']
        with self.assertRaises(ParamValidationError):
            self.validate(deployer.distribution_for_update(self.config))

    def test_error_reporting_omits_sensitive_parameter_values(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            deployer.report_error(ParamValidationError(report='Invalid type for parameter token, value: private-test-value'))
        self.assertNotIn('private-test-value', output.getvalue())
        self.assertIn('ParamValidationError', output.getvalue())

    def validate_policy(self, config):
        shape = get_session().get_service_model('cloudfront').operation_model('UpdateResponseHeadersPolicy').input_shape
        validate_parameters({'Id':'policy','IfMatch':'etag','ResponseHeadersPolicyConfig':config}, shape)

    def test_empty_optional_xss_block_is_omitted_without_changing_other_headers(self):
        config = {'Name':'test', 'SecurityHeadersConfig':{
            'XSSProtection':{}, 'ContentTypeOptions':{'Override':True},
            'FrameOptions':{'Override':True,'FrameOption':'DENY'},
            'ContentSecurityPolicy':{'Override':True,'ContentSecurityPolicy':"default-src 'self'"}}}
        with self.assertRaisesRegex(ParamValidationError, 'XSSProtection'):
            self.validate_policy(config)
        repaired = deployer.response_policy_for_update(config)
        self.validate_policy(repaired)
        self.assertNotIn('XSSProtection', repaired['SecurityHeadersConfig'])
        self.assertEqual(config['SecurityHeadersConfig']['XSSProtection'], {})
        for name in ('ContentTypeOptions','FrameOptions','ContentSecurityPolicy'):
            self.assertEqual(config['SecurityHeadersConfig'][name], repaired['SecurityHeadersConfig'][name])

    def test_configured_xss_settings_are_preserved_including_false(self):
        for protection in (True,False):
            config = {'Name':'test','SecurityHeadersConfig':{'XSSProtection':{'Override':False,'Protection':protection}}}
            repaired = deployer.response_policy_for_update(config)
            self.validate_policy(repaired)
            self.assertEqual(repaired, config)

    def test_partial_xss_settings_are_not_silently_discarded(self):
        config = {'Name':'test','SecurityHeadersConfig':{'XSSProtection':{'Protection':True}}}
        with self.assertRaises(ParamValidationError):
            self.validate_policy(deployer.response_policy_for_update(config))

if __name__ == '__main__':
    unittest.main()
