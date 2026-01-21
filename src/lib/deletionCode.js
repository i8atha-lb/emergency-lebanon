// Deletion Code System
// Allows users to delete their posts using a unique code

/**
 * Generate a random 6-digit deletion code
 * @returns {string} 6-digit code
 */
export const generateDeletionCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Hash a deletion code for secure storage
 * Simple hash using btoa (Base64) - good enough for this use case
 * @param {string} code
 * @returns {string} hashed code
 */
export const hashDeletionCode = (code) => {
  // Simple hash: reverse + base64 encode
  // Not cryptographically secure but sufficient for this use case
  const reversed = code.split('').reverse().join('')
  return btoa(reversed + 'salt_lb_emergency')
}

/**
 * Verify if a code matches the stored hash
 * @param {string} code - User entered code
 * @param {string} storedHash - Hash from database
 * @returns {boolean}
 */
export const verifyDeletionCode = (code, storedHash) => {
  try {
    const hashedInput = hashDeletionCode(code)
    return hashedInput === storedHash
  } catch (error) {
    console.error('Error verifying deletion code:', error)
    return false
  }
}

/**
 * Format deletion code for display (with spaces for readability)
 * @param {string} code
 * @returns {string} "427 593"
 */
export const formatCodeForDisplay = (code) => {
  return code.replace(/(\d{3})(\d{3})/, '$1 $2')
}

// Rate limiting for deletion attempts (prevent brute force)
const deletionAttempts = new Map()

/**
 * Check if deletion attempts should be rate limited
 * @param {string} postId
 * @returns {boolean} true if rate limited
 */
export const isRateLimited = (postId) => {
  const now = Date.now()
  const attempts = deletionAttempts.get(postId) || []

  // Clean old attempts (older than 1 minute)
  const recentAttempts = attempts.filter(time => now - time < 60000)

  // Allow max 3 attempts per minute
  if (recentAttempts.length >= 3) {
    return true
  }

  // Record this attempt
  recentAttempts.push(now)
  deletionAttempts.set(postId, recentAttempts)

  return false
}

/**
 * Clean up rate limit tracking after successful deletion
 * @param {string} postId
 */
export const clearRateLimitTracking = (postId) => {
  deletionAttempts.delete(postId)
}
