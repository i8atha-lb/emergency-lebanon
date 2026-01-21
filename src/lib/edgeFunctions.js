// Edge Functions Integration
// These functions call Supabase Edge Functions for rate limiting and IP blocking

const EDGE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/functions/v1') || ''

/**
 * Check if user is rate limited
 * @param {string} action - 'post_shelter', 'post_aid', 'post_request', or 'report'
 * @param {string} deviceId - Device UUID
 * @returns {Promise<{allowed: boolean, remaining?: number, error?: string}>}
 */
export const checkRateLimit = async (action, deviceId) => {
  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, deviceId })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow if check fails
    return { allowed: true, error: 'Check failed, allowing action' }
  }
}

/**
 * Check if user's IP is blocked
 * @returns {Promise<{allowed: boolean, message?: string}>}
 */
export const checkIPAccess = async () => {
  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/ip-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
