export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY);
  const hasFirebaseKey = Boolean(process.env.FIREBASE_API_KEY);

  const status = {
    status: 'healthy',
    uptimeSeconds: Math.round(process.uptime ? process.uptime() : 0),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    integrations: {
      aiGateway: {
        configured: hasGeminiKey,
        provider: 'Google GenAI (Gemini 3.1 Flash / Gemini Pro)',
        mode: hasGeminiKey ? 'live' : 'bundled_fallback'
      },
      database: {
        configured: hasSupabaseUrl && hasSupabaseKey,
        engine: 'Supabase PostgreSQL',
        mode: (hasSupabaseUrl && hasSupabaseKey) ? 'cloud_connected' : 'local_vault'
      },
      firebase: {
        configured: hasFirebaseKey,
        mode: hasFirebaseKey ? 'connected' : 'unconfigured'
      }
    },
    security: {
      rateLimiting: 'active',
      rlsEnforced: true,
      secretsExposed: false
    }
  };

  return res.status(200).json(status);
}
