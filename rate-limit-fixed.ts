// Rate Limiting Edge Function (FIXED)
// Prevents abuse by limiting actions per device/IP

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
}

interface RateLimitRequest {
  action: 'post_shelter' | 'post_aid' | 'post_request' | 'report'
  deviceId: string
  recordAction?: boolean  // Whether to record this as an actual action
}

const RATE_LIMITS = {
  post_shelter: { max: 7, windowMinutes: 60 },
  post_aid: { max: 7, windowMinutes: 60 },
  post_request: { max: 7, windowMinutes: 60 },
  report: { max: 10, windowMinutes: 60 },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, deviceId, recordAction = false }: RateLimitRequest = await req.json()

    if (!action || !deviceId) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Missing action or deviceId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const limit = RATE_LIMITS[action]
    if (!limit) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Invalid action type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - limit.windowMinutes * 60 * 1000)

    // Check existing actions in window (only count actual recorded actions)
    const { data: recentActions, error } = await supabaseClient
      .from('rate_limits')
      .select('count')
      .eq('identifier', deviceId)
      .eq('action_type', action)
      .gte('window_start', windowStart.toISOString())

    if (error) {
      console.error('Error checking rate limit:', error)
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed, allowing action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalActions = recentActions?.reduce((sum, record) => sum + (record.count || 0), 0) || 0

    // Check if limit would be exceeded
    if (totalActions >= limit.max) {
      return new Response(
        JSON.stringify({
          allowed: false,
          error: `تم تجاوز الحد المسموح. الحد الأقصى: ${limit.max} ${getActionLabel(action)} كل ${limit.windowMinutes} دقيقة`,
          remaining: 0,
          resetMinutes: Math.ceil((new Date(recentActions[0].window_start).getTime() + limit.windowMinutes * 60 * 1000 - now.getTime()) / (60 * 1000))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }  // 200 not 429
      )
    }

    // Only record if recordAction is true (called AFTER successful post)
    if (recordAction) {
      await supabaseClient
        .from('rate_limits')
        .insert({
          identifier: deviceId,
          action_type: action,
          count: 1,
          window_start: now.toISOString()
        })

      // Clean up old records
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      await supabaseClient
        .from('rate_limits')
        .delete()
        .lt('window_start', twoHoursAgo.toISOString())
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: limit.max - totalActions - (recordAction ? 1 : 0),
        resetMinutes: limit.windowMinutes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in rate-limit function:', error)
    return new Response(
      JSON.stringify({ allowed: true, error: 'Internal error, allowing action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    post_shelter: 'منشور مأوى',
    post_aid: 'منشور مساعدة',
    post_request: 'طلب مأوى',
    report: 'بلاغ'
  }
  return labels[action] || action
}
