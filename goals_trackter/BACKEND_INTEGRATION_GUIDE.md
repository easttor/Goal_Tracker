# Backend Integration Guide - Phase 2

## Overview
Phase 2 features currently use client-side storage (localStorage) as a temporary solution. This guide explains how to migrate to full backend integration with Supabase for production deployment.

## Current State vs. Target State

### Current Implementation (Temporary)
- **Notification Settings**: Stored in browser localStorage
- **Scheduled Notifications**: Stored in browser localStorage
- **Recurring Task Patterns**: Saved to tasks table (✓ already backend)
- **Calendar Data**: Generated from goals/tasks (✓ already backend)

### Target Implementation (Production-Ready)
- **Notification Settings**: user_preferences table in Supabase
- **Scheduled Notifications**: Processed via Edge Functions with cron jobs
- **Recurring Task Patterns**: Already in tasks table
- **Calendar Data**: Already generated from backend data

## Migration Steps

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard**
1. Log in to Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `/supabase/migrations/20251104_phase2_backend_integration.sql`
4. Run the SQL
5. Verify tables created successfully

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### Step 2: Update NotificationsService

Replace localStorage methods with Supabase calls:

**Current (localStorage):**
```typescript
static getPreferences(): NotificationPreferences {
  const stored = localStorage.getItem(this.STORAGE_KEY)
  return stored ? JSON.parse(stored) : this.DEFAULT_PREFERENCES
}
```

**Target (Supabase):**
```typescript
static async getPreferences(userId: string): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) return this.DEFAULT_PREFERENCES
  
  return {
    enabled: data.notifications_enabled,
    deadlineNotifications: data.deadline_notifications,
    deadline1DayBefore: data.deadline_1day_before,
    deadline3DaysBefore: data.deadline_3days_before,
    deadline1WeekBefore: data.deadline_1week_before,
    habitRemindersEnabled: data.habit_reminders_enabled,
    habitReminderTime: data.habit_reminder_time,
    weeklyReportEnabled: data.weekly_report_enabled,
    weeklyReportDay: data.weekly_report_day,
    achievementNotifications: data.achievement_notifications,
  }
}
```

### Step 3: Create Edge Function for Notification Processing

**File:** `supabase/functions/process-notifications/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Check for upcoming deadlines
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const { data: goals } = await supabase
    .from('goals')
    .select('*, user_id')
    .lte('deadline', threeDaysFromNow.toISOString())
    .gte('deadline', new Date().toISOString())

  // Send notifications to users
  // Implementation depends on notification delivery method
  // (Web Push, Email, SMS, etc.)

  return new Response(JSON.stringify({ processed: goals?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Step 4: Set Up Cron Job

In Supabase Dashboard:
1. Go to Edge Functions
2. Create cron job:
   - Function: `process-notifications`
   - Schedule: `0 9 * * *` (daily at 9 AM)
   - Or: `0 */6 * * *` (every 6 hours)

### Step 5: Update Frontend Services

**NotificationsService changes:**
```typescript
// Add userId parameter to all methods
static async savePreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      notifications_enabled: preferences.enabled,
      deadline_notifications: preferences.deadlineNotifications,
      // ... map all fields
    })
}
```

**Update App.tsx initialization:**
```typescript
useEffect(() => {
  if (!user) return

  // Load preferences from Supabase instead of localStorage
  NotificationsService.getPreferences(user.id).then(prefs => {
    // Handle loaded preferences
  })
}, [user])
```

### Step 6: Migrate Existing User Data

**Optional migration script** to move localStorage data to Supabase:

```typescript
async function migrateLocalStorageToSupabase(userId: string) {
  // Get from localStorage
  const localPrefs = localStorage.getItem('notification_preferences')
  if (!localPrefs) return

  const prefs = JSON.parse(localPrefs)

  // Save to Supabase
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      notifications_enabled: prefs.enabled,
      // ... rest of mapping
    })

  // Clear localStorage after successful migration
  localStorage.removeItem('notification_preferences')
}
```

## Testing the Migration

### 1. Test Database Schema
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_preferences');

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'user_preferences';
```

### 2. Test CRUD Operations
```typescript
// Test creating preferences
const testPrefs = {
  user_id: 'test-user-id',
  notifications_enabled: true,
  deadline_1day_before: true,
}

await supabase.from('user_preferences').insert(testPrefs)

// Test reading
const { data } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', 'test-user-id')
  .single()

console.log('Preferences:', data)
```

### 3. Test Edge Function
```bash
# Deploy function
supabase functions deploy process-notifications

# Test invocation
curl -X POST https://your-project.supabase.co/functions/v1/process-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Benefits of Backend Integration

### Current (localStorage) Limitations:
- Settings not synced across devices
- Notifications only work when browser open
- Data lost if browser cache cleared
- No server-side processing

### After Migration Benefits:
- Settings sync across all user devices
- Server-side notification processing
- Reliable notification delivery
- Better security and data persistence
- Professional multi-device experience

## Rollback Plan

If issues occur during migration:

1. **Keep localStorage fallback:**
```typescript
static async getPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    // Try Supabase first
    const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single()
    if (data) return this.mapToPreferences(data)
  } catch (error) {
    console.warn('Falling back to localStorage:', error)
  }
  
  // Fallback to localStorage
  return this.getLocalPreferences()
}
```

2. **Gradual migration:**
   - Deploy with fallback enabled
   - Monitor error rates
   - Migrate users gradually
   - Remove fallback after 100% migration

## Timeline Estimate

- **Database Migration**: 5 minutes
- **Service Updates**: 2 hours
- **Edge Function Creation**: 1 hour
- **Frontend Updates**: 2 hours
- **Testing**: 1 hour
- **Deployment**: 30 minutes

**Total**: ~6-7 hours for complete backend integration

## Current Status

**Already Implemented (No Migration Needed):**
- Recurring task patterns → Saved to tasks table ✓
- Calendar event data → Generated from goals/tasks ✓
- Task management → Full Supabase integration ✓

**Requires Migration:**
- Notification preferences → localStorage → user_preferences table
- Scheduled notifications → localStorage → Edge Functions with cron

**Priority:** Medium
**Impact:** Enhanced user experience, multi-device sync
**Complexity:** Medium (well-defined migration path)

## Conclusion

The current implementation works well for single-device usage. Backend integration is recommended for:
1. Production deployments
2. Multi-device support
3. Enterprise customers
4. Reliable notification delivery

The migration path is clear and can be completed in a dedicated development sprint.
