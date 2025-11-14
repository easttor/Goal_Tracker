# iOS Liquid Glass Redesign - Manual Testing Guide

## Deployed URL
**Production**: https://lv6pctayjsl7.space.minimax.io

## What's New - iOS Liquid Glass Design

### Navigation Changes
- Bottom nav reduced from 8 items to 4 items: **Diary, Goals, Habits, Statistics**
- Central **Floating Action Button (FAB)** with Plus icon added
- **Calendar, Social, Teams** screens removed from bottom nav (still accessible)
- **Profile** screen now accessible via top-right avatar button

### UI/UX Enhancements
- **Glass Morphism**: Translucent backgrounds with blur effects
- **Top-Right Controls**: Profile avatar + Notifications bell with glass styling
- **Theme Toggle**: Moved from top-left to Profile settings section
- **iOS Background**: Light gray (#F2F2F7) for authentic iOS feel
- **Smooth Animations**: Liquid highlight indicator, scale transitions, FAB pulse

## Visual Verification Checklist

### 1. Initial Page Load
- [ ] Background color is light iOS gray (#F2F2F7)
- [ ] Bottom navigation bar has glass effect (translucent/blurred)
- [ ] Only 4 nav items visible: Diary, Goals, Habits, Statistics
- [ ] Central FAB (blue circle with plus icon) is elevated above navbar
- [ ] Top-right shows 2 buttons: Notifications bell + Profile avatar
- [ ] NO theme toggle button in top-left corner

### 2. Glass Effects
- [ ] Bottom nav has translucent glass background
- [ ] Top-right buttons have subtle glass effect
- [ ] Glass effects show blur/transparency
- [ ] All glass elements have subtle borders

### 3. Navigation Interactions
- [ ] Active nav item is blue with scale effect
- [ ] Inactive nav items are 60% opacity
- [ ] Liquid blue highlight bar animates smoothly between items
- [ ] Clicking nav items transitions screens smoothly

## Functional Testing

### Authentication
1. **Login with Demo Account**
   - Click "Try Demo Account" button
   - Should redirect to Diary screen immediately
   - Top-right should show Profile avatar with initials

### Bottom Navigation (4 Items)
1. **Test Each Nav Item**
   - Click "Diary" → Shows today's tasks and goals overview
   - Click "Goals" → Shows all goals with CRUD capabilities
   - Click "Habits" → Shows habit tracking interface
   - Click "Statistics" → Shows charts and statistics
   
2. **Verify Active States**
   - Active item is blue (#007AFF)
   - Active item scales up (1.1x)
   - Blue highlight bar is positioned under active item
   - Transitions are smooth (300ms)

### Floating Action Button (FAB)
1. **Click FAB** (blue circle with plus icon)
   - Should open "Add Goal" modal
   - Modal should have glass background
   - FAB should pulse gently when idle
   
2. **Close Modal**
   - Click outside modal or close button
   - Modal should animate out smoothly

### Top-Right Controls
1. **Notifications Button** (bell icon)
   - Click to open notifications center
   - Should display notification settings/list
   - Has glass styling with blue accent color
   
2. **Profile Avatar Button**
   - Shows user initials in colored gradient circle
   - Click to navigate to Profile screen
   - Avatar has subtle ring border (white 20% opacity)

### Profile Screen
1. **Navigate to Profile**
   - Click Profile avatar in top-right
   - Should show user info, stats, and settings
   
2. **Theme Toggle Location**
   - Scroll to "Settings" section
   - Should see "Light Mode" or "Dark Mode" toggle
   - Toggle switch should be visible and functional
   
3. **Test Theme Toggle**
   - Click theme toggle to switch to dark mode
   - Background should change to black (#000000)
   - Glass effects should adapt (darker translucency)
   - All text remains readable
   - Toggle back to light mode
   - Everything returns to light theme

### Dark Mode Verification
1. **Enable Dark Mode**
   - Go to Profile → Settings → Toggle theme
   
2. **Check Dark Mode Styling**
   - Background is pure black (#000000)
   - Glass effects use dark values
   - Text is light colored (#f9fafb)
   - All screens adapt properly
   - Navigation glass effect is darker
   - FAB remains visible and blue
   
3. **Return to Light Mode**
   - Toggle theme again
   - All elements return to light styling

### Screen Accessibility
Since Calendar, Social, and Teams are removed from navbar, verify they're still functional:
1. **Calendar** - Can be accessed from other UI elements (if implemented)
2. **Social** - Can be accessed from other UI elements (if implemented)
3. **Teams** - Can be accessed from other UI elements (if implemented)
4. **Profile** - Accessible via top-right avatar button ✓

### CRUD Operations (Ensure existing functionality)
1. **Create Goal** (via FAB)
   - Click FAB → Add goal details → Save
   - Goal should appear in Goals screen
   
2. **Edit Goal**
   - Go to Goals screen → Click on a goal → Edit
   - Changes should save properly
   
3. **Delete Goal**
   - Click delete icon on goal → Confirm
   - Goal should be removed
   
4. **Task Management**
   - Add task to a goal
   - Toggle task completion
   - Edit task details
   - Delete task

## Responsive Design
1. **Mobile View** (if testing on desktop, resize browser)
   - Bottom nav remains functional
   - FAB stays centered
   - Top controls stay visible
   - All screens adapt properly

## Performance Checks
1. **Animations**
   - Nav transitions should be smooth (no jank)
   - FAB pulse animation should be subtle
   - Theme toggle should transition smoothly
   
2. **Glass Effects**
   - Blur effects should render properly
   - No performance issues with backdrop-filter
   - Glass elements don't flicker

## Common Issues to Check
- [ ] No console errors in browser dev tools (F12)
- [ ] All images load properly
- [ ] Data persists after page refresh
- [ ] Theme preference persists after reload
- [ ] No white screen or blank pages
- [ ] All buttons are clickable (no z-index issues)

## Success Criteria
✅ Bottom nav shows exactly 4 items + FAB
✅ Top-right has Profile + Notifications buttons
✅ NO theme toggle in top-left
✅ Theme toggle works in Profile settings
✅ Glass morphism effects visible throughout
✅ Smooth animations on all interactions
✅ Dark mode works properly
✅ All existing features remain functional
✅ FAB opens Add Goal modal
✅ Profile navigation works from top-right

## Testing Time Estimate
- **Quick Test** (critical features): 5-10 minutes
- **Comprehensive Test** (all features): 20-30 minutes

## Report Issues
If you find any bugs or issues:
1. Note which feature/screen has the problem
2. Describe what you expected vs. what happened
3. Include any console errors (F12 → Console tab)
4. Note if it's in light mode, dark mode, or both
