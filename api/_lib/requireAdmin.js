import { createClient } from '@supabase/supabase-js';

const ADMIN_ALLOWLIST_EMAILS = [
  'admin@zaboraa.com',
  'congodb1992@gmail.com',
  'congodb4@gmail.com',
  'wasim.sayyed@zaboraa-cloud.com',
  'anansari678@gmail.com',
];

/**
 * Creates a server-side Supabase admin client using available service-role or anon key.
 */
export function getAdminSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Validates whether an email has administrative privileges.
 */
export function isAuthoritativeAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  return (
    ADMIN_ALLOWLIST_EMAILS.includes(lower) ||
    lower.endsWith('@zaboraa.com')
  );
}

/**
 * Enforces admin-only access on serverless endpoints.
 * Returns { authorized: true, user, profile, supabase } or sends HTTP 401/403 and returns { authorized: false }.
 */
export async function requireAdmin(req, res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid authentication token.',
    });
    return { authorized: false, status: 401 };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Empty token provided.',
    });
    return { authorized: false, status: 401 };
  }

  const supabase = getAdminSupabaseClient();
  if (!supabase) {
    // If Supabase server keys are not configured, check token structure or reject safely
    res.status(500).json({
      success: false,
      error: 'Server authentication configuration is missing.',
    });
    return { authorized: false, status: 500 };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired session token.',
      details: userError?.message || 'User verification failed.',
    });
    return { authorized: false, status: 401 };
  }

  const user = userData.user;
  const userEmail = user.email ? user.email.toLowerCase().trim() : '';

  // 1. Direct email allowlist verification
  if (isAuthoritativeAdminEmail(userEmail)) {
    return { authorized: true, user, email: userEmail, supabase };
  }

  // 2. Query public.profiles role
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('id', user.id)
    .single();

  if (!profileError && profileData) {
    if (profileData.role === 'admin' && profileData.status !== 'suspended') {
      return { authorized: true, user, email: userEmail, profile: profileData, supabase };
    }
  }

  res.status(403).json({
    success: false,
    error: 'Forbidden: Admin access privileges required.',
  });
  return { authorized: false, status: 403 };
}
