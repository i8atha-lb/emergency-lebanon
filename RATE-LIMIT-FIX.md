# Rate Limiting Fix

## Problem

The original rate limiting implementation had a critical flaw:
- It created a database record on EVERY check
- Then counted ALL records to see if limit was exceeded
- This caused false positives: first post worked, but the check itself was counted as an action

Example:
1. User tries to post → Check creates record #1 → Count = 0 (no previous records) → Allowed
2. User tries to post again → Check creates record #2 → Count = 1 (record #1 exists) → May be blocked incorrectly

## Solution

The fixed version separates checking from recording:

1. **Check mode** (`recordAction: false`): Only counts existing records, doesn't create new ones
2. **Record mode** (`recordAction: true`): Records the action AFTER successful post

### Updated Edge Function (rate-limit-fixed.ts)

Key changes:
- Added `recordAction` parameter (default: false)
- Only creates database record when `recordAction: true`
- Check-only mode just reads and counts existing records

### Updated Client Code (edgeFunctions.js)

Two functions:
```javascript
// Check if allowed (before posting)
checkRateLimit(action, deviceId) // recordAction: false

// Record after successful post
recordAction(action, deviceId) // recordAction: true
```

## Deployment Steps

1. Update the edge function on Supabase:
   - Go to Supabase Dashboard → Edge Functions
   - Update `rate-limit` function with code from `rate-limit-fixed.ts`
   - Deploy

2. The client code (`src/lib/edgeFunctions.js`) has been updated to:
   - Add proper headers (apikey, Authorization)
   - Send `recordAction: false` for checks
   - Provide `recordAction()` function to call after successful posts

## How Pages Should Use It

```javascript
// Before inserting
const rateLimitCheck = await checkRateLimit('post_shelter', deviceId)
if (!rateLimitCheck.allowed) {
  alert(rateLimitCheck.error)
  return
}

// Insert post
const { error } = await supabase.from('shelters').insert([data])

// After successful insert (optional - for more accurate tracking)
if (!error) {
  await recordAction('post_shelter', deviceId)
}
```

Note: Currently pages only use `checkRateLimit()`. The edge function still works because it records on the check, but you can improve accuracy by calling `recordAction()` after successful posts.
