// Edge Functions Integration
// These functions call Supabase Edge Functions for rate limiting and IP blocking
//
// IMPORTANT: Edge functions must be deployed with --no-verify-jwt flag:
//   supabase functions deploy rate-limit --no-verify-jwt
//   supabase functions deploy ip-check --no-verify-jwt

const EDGE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/functions/v1') || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Edge functions enabled (JWT verification disabled in Supabase dashboard)
const EDGE_FUNCTIONS_ENABLED = true

/**
 * Check if user is rate limited (check only, doesn't record)
 * @param {string} action - 'post_shelter', 'post_aid', 'post_request', or 'report'
 * @param {string} deviceId - Device UUID
 * @returns {Promise<{allowed: boolean, remaining?: number, error?: string}>}
 */
export const checkRateLimit = async (action, deviceId) => {
  // Skip if edge functions are disabled or not configured
  if (!EDGE_FUNCTIONS_ENABLED || !EDGE_FUNCTIONS_URL || !SUPABASE_ANON_KEY) {
    return { allowed: true }
  }

  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action, deviceId, recordAction: false })
    })

    // If response is not ok, fail open
    if (!response.ok) {
      console.error('Rate limit response not ok:', response.status, response.statusText)
      return { allowed: true, error: 'Rate limit check failed' }
    }

    const data = await response.json()

    // Ensure allowed is explicitly boolean
    if (typeof data.allowed !== 'boolean') {
      console.error('Invalid rate limit response:', data)
      return { allowed: true, error: 'Invalid response' }
    }

    return data
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow if check fails
    return { allowed: true, error: 'Check failed, allowing action' }
  }
}

/**
 * Record a successful action (call AFTER successful post/report)
 * @param {string} action - 'post_shelter', 'post_aid', 'post_request', or 'report'
 * @param {string} deviceId - Device UUID
 */
export const recordAction = async (action, deviceId) => {
  if (!EDGE_FUNCTIONS_ENABLED) return

  try {
    await fetch(`${EDGE_FUNCTIONS_URL}/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action, deviceId, recordAction: true })
    })
  } catch (error) {
    console.error('Failed to record action:', error)
  }
}

/**
 * Check if user's IP is blocked
 * @returns {Promise<{allowed: boolean, message?: string}>}
 */
export const checkIPAccess = async () => {
  // Skip if edge functions are disabled
  if (!EDGE_FUNCTIONS_ENABLED || !EDGE_FUNCTIONS_URL) {
    return { allowed: true }
  }

  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/ip-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('IP check failed:', error)
    // Fail open - allow if check fails
    return { allowed: true, error: 'Check failed, allowing access' }
  }
}
