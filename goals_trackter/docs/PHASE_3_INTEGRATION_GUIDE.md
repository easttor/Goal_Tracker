# Phase 3: Integration Guide

## Overview
This document outlines how to integrate Phase 3 Social Collaboration features into the existing Goals Tracker application.

---

## 1. Update UserProfileScreen Component

### Location
`/workspace/goals-tracker/src/components/UserProfileScreen.tsx`

### Changes Required

#### Add Social Statistics Section
```typescript
import { SocialService } from '../lib/socialService'
import type { SocialStatistics, UserProfile } from '../types'

// Add state
const [socialStats, setSocialStats] = useState<SocialStatistics | null>(null)
const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

// Load social data
useEffect(() => {
  const loadSocialData = async () => {
    if (!user) return
    const [profile, stats] = await Promise.all([
      SocialService.getCurrentUserProfile(),
      SocialService.getSocialStatistics(user.id)
    ])
    setUserProfile(profile)
    setSocialStats(stats)
  }
  loadSocialData()
}, [user])
```

#### Add Social Stats Display
```tsx
{/* Social Statistics */}
<div className="grid grid-cols-2 gap-4 mb-6">
  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {socialStats?.followers || 0}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
  </div>
  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {socialStats?.following || 0}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
  </div>
  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {socialStats?.shared_goals || 0}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">Shared Goals</div>
  </div>
  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {socialStats?.team_goals || 0}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">Team Goals</div>
  </div>
</div>
```

#### Add Find Users Button
```tsx
<button
  onClick={() => setShowUserSearch(true)}
  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-4"
>
  <Users className="w-5 h-5" />
  <span>Find Users</span>
</button>

{/* Modal */}
{showUserSearch && (
  <UserSearchModal onClose={() => setShowUserSearch(false)} />
)}
```

---

## 2. Update GoalsScreen Component

### Location
`/workspace/goals-tracker/src/components/GoalsScreen.tsx`

### Changes Required

#### Import Social Components
```typescript
import { GoalSharingModal } from './GoalSharingModal'
import { CommentsPanel } from './CommentsPanel'
import { Share2, MessageCircle, Eye, EyeOff, Users } from 'lucide-react'
```

#### Add State for Modals
```typescript
const [sharingGoalId, setSharingGoalId] = useState<string | null>(null)
const [commentingGoalId, setCommentingGoalId] = useState<string | null>(null)
const [goalVisibility, setGoalVisibility] = useState<{ [key: string]: 'public' | 'private' | 'followers' }>({})
```

#### Add Action Buttons to Goal Cards
```tsx
{/* Add to each goal card */}
<div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
  <button
    onClick={(e) => {
      e.stopPropagation()
      setSharingGoalId(goal.id)
    }}
    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
  >
    <Share2 className="w-4 h-4" />
    <span>Share</span>
  </button>
  
  <button
    onClick={(e) => {
      e.stopPropagation()
      setCommentingGoalId(goal.id)
    }}
    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
  >
    <MessageCircle className="w-4 h-4" />
    <span>Comments</span>
  </button>
  
  <button
    onClick={(e) => {
      e.stopPropagation()
      toggleVisibility(goal.id)
    }}
    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
  >
    {goalVisibility[goal.id] === 'public' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    <span>{goalVisibility[goal.id] || 'Private'}</span>
  </button>
</div>
```

#### Add Modals at End of Component
```tsx
{/* Goal Sharing Modal */}
{sharingGoalId && (
  <GoalSharingModal
    goalId={sharingGoalId}
    goalTitle={goals.find(g => g.id === sharingGoalId)?.title || ''}
    onClose={() => setSharingGoalId(null)}
  />
)}

{/* Comments Panel */}
{commentingGoalId && (
  <CommentsPanel
    goalId={commentingGoalId}
    onClose={() => setCommentingGoalId(null)}
  />
)}
```

---

## 3. Update NavBar Component

### Location
`/workspace/goals-tracker/src/components/NavBar.tsx`

### Changes Required

#### Add Social Tab
```typescript
const tabs = [
  { name: 'Today', icon: Calendar },
  { name: 'Goals', icon: Target },
  { name: 'Habits', icon: TrendingUp },
  { name: 'Statistics', icon: BarChart3 },
  { name: 'Social', icon: Users }, // NEW
  { name: 'Teams', icon: Users2 }, // NEW
  { name: 'Profile', icon: User }
]
```

---

## 4. Update App.tsx Component

### Location
`/workspace/goals-tracker/src/components/App.tsx`

### Changes Required

#### Import New Components
```typescript
import { ActivityFeedScreen } from './components/ActivityFeedScreen'
import { TeamGoalsScreen } from './components/TeamGoalsScreen'
import { ActivityService } from './lib/activityService'
```

#### Add Activity Tracking to Goal/Task Completion
```typescript
// When a goal is completed
const handleCompleteGoal = async (goalId: string) => {
  const goal = goals.find(g => g.id === goalId)
  if (!goal) return
  
  // Existing completion logic...
  
  // Track activity
  await ActivityService.trackGoalCompletion(goalId, goal.title)
  
  // Refetch goals...
}

// When a task is completed
const handleToggleTask = async (goalId: string, taskId: string) => {
  const goal = goals.find(g => g.id === goalId)
  const task = goal?.tasks.find(t => t.id === taskId)
  if (!task) return
  
  // Existing toggle logic...
  
  // If task is being completed (not uncompleted)
  if (!task.is_complete) {
    await ActivityService.trackTaskCompletion(taskId, task.text, goalId)
  }
  
  // Optimistic update...
}
```

#### Add Screen Routing
```typescript
const renderScreen = () => {
  switch (activeTab) {
    case 'Today':
      return <DiaryScreen />
    case 'Goals':
      return <GoalsScreen />
    case 'Habits':
      return <HabitsScreen />
    case 'Statistics':
      return <StatisticsScreen />
    case 'Social': // NEW
      return <ActivityFeedScreen />
    case 'Teams': // NEW
      return <TeamGoalsScreen />
    case 'Profile':
      return <UserProfileScreen />
    default:
      return <DiaryScreen />
  }
}
```

---

## 5. Update TaskModalEnhanced Component

### Location
`/workspace/goals-tracker/src/components/TaskModalEnhanced.tsx`

### Changes Required

#### Add Comments Button
```tsx
{/* Add near the end of the modal, before Save button */}
{task?.id && (
  <button
    type="button"
    onClick={() => setShowComments(true)}
    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
  >
    <MessageCircle className="w-5 h-5" />
    <span>View Comments</span>
    {commentCount > 0 && (
      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
        {commentCount}
      </span>
    )}
  </button>
)}

{/* Add modal state and render */}
{showComments && task?.id && (
  <CommentsPanel
    taskId={task.id}
    onClose={() => setShowComments(false)}
  />
)}
```

---

## 6. Database Migration Application

### Prerequisites
- Supabase access token must be valid
- Project connection must be active

### Steps

1. **Apply Migration**
```bash
# Via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of /workspace/goals-tracker/supabase/migrations/20251104_phase3_social_collaboration.sql
# 3. Execute the SQL

# OR via CLI (if token is working):
supabase db push
```

2. **Verify Tables**
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles', 
  'user_follows', 
  'goal_shares', 
  'team_goals', 
  'team_members', 
  'comments', 
  'comment_reactions', 
  'activity_feed'
);
```

3. **Test RLS Policies**
```sql
-- Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '<user-id>';

-- Should work
SELECT * FROM user_profiles WHERE id = '<user-id>';

-- Should fail (not your profile)
UPDATE user_profiles SET bio = 'test' WHERE id = '<other-user-id>';
```

4. **Verify Functions**
```sql
SELECT proname FROM pg_proc WHERE proname IN (
  'handle_new_user_profile',
  'create_activity_entry',
  'get_follower_count',
  'get_following_count',
  'is_following'
);
```

---

## 7. Icon Imports

### Add to Component Imports
```typescript
// Icons needed for social features
import { 
  Users, // User list
  UserPlus, // Add user
  UserCheck, // Following indicator
  Share2, // Share button
  MessageCircle, // Comments
  Heart, // Like reaction
  ThumbsUp, // Support reaction
  Award, // Celebrate reaction
  Smile, // Emoji reactions
  Eye, // Public visibility
  EyeOff, // Private visibility
  Users2, // Teams
  TrendingUp, // Activity
  Globe, // Discover
  Calendar, // Deadlines
  Activity // Activity feed
} from 'lucide-react'
```

---

## 8. Environment Variables

### No Additional Variables Needed
Phase 3 uses existing Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 9. Testing Checklist

After integration, test these features:

### User Search & Following
- [ ] Search for users by username
- [ ] Search for users by display name
- [ ] Follow a user
- [ ] Unfollow a user
- [ ] View followers list
- [ ] View following list

### Goal Sharing
- [ ] Share goal with another user
- [ ] Set permission level (viewer, collaborator, admin)
- [ ] Update permission level
- [ ] Remove share
- [ ] View shared goals

### Team Goals
- [ ] Create team goal
- [ ] Add members to team
- [ ] Update team progress
- [ ] Remove team member
- [ ] View team goal details

### Comments
- [ ] Add comment to goal
- [ ] Add comment to task
- [ ] Reply to comment
- [ ] Add reaction to comment
- [ ] Remove reaction
- [ ] @mention users

### Activity Feed
- [ ] View following activity
- [ ] View discover feed
- [ ] Activity auto-tracks goal completion
- [ ] Activity auto-tracks task completion
- [ ] Activity auto-tracks milestones
- [ ] Activity auto-tracks streaks
- [ ] Real-time activity updates

### Privacy & Permissions
- [ ] Set goal to public
- [ ] Set goal to private
- [ ] Set goal to followers-only
- [ ] Collaborators can edit shared goals
- [ ] Viewers can only view shared goals
- [ ] RLS policies prevent unauthorized access

---

## 10. Build & Deploy

```bash
# Install any missing dependencies
cd /workspace/goals-tracker
pnpm install

# Build production bundle
pnpm run build

# Deploy (use existing deployment method)
# The build output will be in /workspace/goals-tracker/dist
```

---

## 11. Post-Deployment Testing

### Critical Tests
1. **User Onboarding**: New users get automatic profile creation
2. **Real-time Updates**: Changes appear immediately for all users
3. **Permissions**: Users cannot access unauthorized data
4. **Performance**: Activity feed loads quickly with many items
5. **Mobile**: All features work on mobile devices

### Performance Optimization
- Implement pagination for activity feed
- Cache user profiles
- Optimize real-time subscriptions
- Add loading skeletons

---

## Files Modified Summary

### New Files Created (Phase 3)
- `src/lib/socialService.ts`
- `src/lib/sharingService.ts`
- `src/lib/commentsService.ts`
- `src/lib/activityService.ts`
- `src/components/UserSearchModal.tsx`
- `src/components/GoalSharingModal.tsx`
- `src/components/CommentsPanel.tsx`
- `src/components/ActivityFeedScreen.tsx`
- `src/components/TeamGoalsScreen.tsx`
- `supabase/migrations/20251104_phase3_social_collaboration.sql`

### Files to Modify
- `src/types/index.ts` (✅ Already updated)
- `src/components/UserProfileScreen.tsx` (Add social stats and find users)
- `src/components/GoalsScreen.tsx` (Add share, comments, visibility)
- `src/components/NavBar.tsx` (Add Social and Teams tabs)
- `src/components/App.tsx` (Add routing and activity tracking)
- `src/components/TaskModalEnhanced.tsx` (Add comments button)

---

## Estimated Integration Time
- Database migration: 15 minutes
- Component updates: 1-2 hours
- Testing: 1 hour
- **Total: 2-3 hours**

---

## Support & Troubleshooting

### Common Issues

**Issue:** RLS policies blocking queries
**Solution:** Check user authentication, verify RLS policies

**Issue:** Real-time subscriptions not working
**Solution:** Check Supabase realtime settings, verify channel names

**Issue:** Comments not appearing
**Solution:** Verify foreign key relationships, check RLS policies

**Issue:** Activity feed empty
**Solution:** Create some activities, check visibility settings

---

Generated: 2025-11-04
Ready for integration once database migration is applied
