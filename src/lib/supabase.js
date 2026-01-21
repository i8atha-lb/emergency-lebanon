import { createClient } from '@supabase/supabase-js'

// These will be environment variables - replace with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Device ID for temporary edit/delete permissions
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

// Check if user can edit/delete a post (within 5 minutes and same device)
export const canEditPost = (post) => {
  const deviceId = getDeviceId()
  const createdAt = new Date(post.created_at)
  const now = new Date()
  const minutesSinceCreation = (now - createdAt) / (1000 * 60)

  return post.device_id === deviceId && minutesSinceCreation < 5
}
