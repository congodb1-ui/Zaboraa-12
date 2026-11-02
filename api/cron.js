// api/cron.js - keeps Supabase Free from pausing
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Security check - Vercel sends this automatically
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY // anon key is enough for app_settings read
    )
    
    // Real DB hit - this resets the 7-day timer
    const { error } = await supabase.from('app_settings').select('id').limit(1)
    
    if (error) throw error
    
    return res.status(200).json({ ok: true, kept_alive: new Date().toISOString() })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
