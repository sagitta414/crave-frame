export async function databaseOptions(env, readSecret, makeSigner) {
  let user = 'crave_app', password;
  if (env.APP_SECRET_ARN) {
    const credentials = await readSecret(env.APP_SECRET_ARN);
    if (credentials.username !== user || typeof credentials.password !== 'string' || !credentials.password) {
      throw new Error('Invalid application database credentials');
    }
    // Refresh on each new connection so secret rotation does not require deployment.
    password = async () => {
      const current = await readSecret(env.APP_SECRET_ARN);
      if (current.username !== user || typeof current.password !== 'string' || !current.password) throw new Error('Invalid application database credentials');
      return current.password;
    };
  } else {
    const signer = makeSigner({hostname:env.DB_HOST, port:5432, username:user, region:env.AWS_REGION});
    password = () => signer.getAuthToken();
  }
  return {host:env.DB_HOST, port:5432, user, database:'craveframe', password,
    ssl:{rejectUnauthorized:true,minVersion:'TLSv1.2'}, max:2,
    idleTimeoutMillis:60000,connectionTimeoutMillis:4000,statement_timeout:15000};
}
