// Catalog mode makes no model calls, even if an old credential is still present.
export function aiCapabilities(env = {}) {
  const connected = env.AI_PROVIDER !== 'catalog' && Boolean(env.AI_GENERATE || env.GCP_SERVICE_ACCOUNT_JSON);
  return {connected, provider: connected ? (env.AI_GENERATE ? 'Configured AI' : 'Gemini on Vertex AI') : null, matchingMode: connected ? 'ai' : 'catalog'};
}
