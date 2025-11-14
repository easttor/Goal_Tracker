# Phase 2 Features - Quick Testing Guide

## Deployment URL
**Production**: https://0npv3qihrkq1.space.minimax.io

## Pre-Test Setup
1. Visit the deployment URL
2. Click "Try Demo Account" to log in
3. Wait for app to load with default goals/tasks

## Test Scenarios

### 1. Smart Notifications (5 minutes)

**Test: Permission Request**
1. Click notification bell icon (top-right corner, purple)
2. Verify NotificationsCenter modal opens
3. If not granted, click "Enable Notifications" button
4. Grant permission in browser prompt
5. Verify success notification appears

**Expected Result**: Permission granted, modal shows enabled state

**Test: Configure Settings**
1. Toggle "All Notifications" switch OFF then ON
2. Check/uncheck individual deadline reminders
3. Enable "Daily Habit Reminders"
4. Set reminder time to 10:00 AM
5. Click "Save & Close"
6. Reopen modal - verify settings persisted

**Expected Result**: All settings saved and restored correctly

**Test: Manual Notification Trigger**
1. Open browser DevTools console
2. Run: `NotificationsService.showNotification('Test', { body: 'Testing notifications' })`
3. Verify notification appears (if permissions granted)

**Expected Result**: Test notification displays

### 2. Calendar View (8 minutes)

**Test: Navigation**
1. Click Calendar tab (4th icon from left in bottom nav)
2. Verify calendar loads with current month
3. Check quick stats at top show numbers > 0
4. Verify today's date is highlighted

**Expected Result**: Calendar displays with goals and tasks as events

**Test: View Modes**
1. Click "Month" button - verify month view
2. Click "Week" button - verify week view (7 days visible)
3. Click "Agenda" button - verify list view of events
4. Click "Today" button - verify returns to current date

**Expected Result**: All 3 views work correctly

**Test: Navigation Controls**
1. In Month view, click left arrow (previous month)
2. Click right arrow (next month)
3. Click "Today" to return to current month
4. Verify month/year label updates correctly

**Expected Result**: Navigation works smoothly

**Test: Event Display**
1. Look for colored event blocks in calendar
2. Verify demo goals appear as events on their deadline dates
3. Verify demo tasks appear on their due dates
4. Check event colors match priorities (Red=high, Amber=medium, Green=low)
5. Look for recurring tasks marked with ↻ symbol

**Expected Result**: All events display with correct colors and dates

**Test: Overdue Alert**
1. If overdue tasks exist, verify red alert banner appears above calendar
2. Check banner shows count and first few task names
3. Verify clicking tasks in agenda view (if implemented)

**Expected Result**: Overdue tasks clearly indicated

**Test: Dark Mode**
1. Toggle dark mode (button in top-left)
2. Verify calendar colors adapt to dark theme
3. Check calendar grid lines visible
4. Verify text readable in dark mode

**Expected Result**: Calendar fully functional in dark mode

**Test: Legend**
1. Scroll to bottom of calendar screen
2. Verify legend shows color meanings:
   - Goals (blue)
   - High Priority (red)
   - Medium Priority (amber)
   - Low Priority (green)
   - Recurring symbol (↻)

**Expected Result**: Legend clearly displays all event types

### 3. Recurring Tasks (5 minutes)

**Test: Task Creation (Backend Ready)**
1. Go to Goals screen
2. Select a goal
3. Add a new task
4. Note: Recurring UI integration pending in task modal
5. Verify task appears in calendar

**Expected Result**: Task visible in calendar on due date

**Test: Calendar Integration**
1. Return to Calendar view
2. Look for tasks on their due dates
3. Check if any existing tasks show as recurring (↻ symbol)
4. Verify recurring task appears multiple times if pattern set

**Expected Result**: Recurring tasks show future occurrences

**Test: Service Layer (DevTools)**
1. Open browser console
2. Run: `RecurringTasksService.createPattern('daily', 1)`
3. Verify returns pattern object: `{ frequency: 'daily', interval: 1 }`
4. Run: `RecurringTasksService.getPatternDescription({ frequency: 'daily', interval: 1 })`
5. Verify returns: "Every day"

**Expected Result**: Recurring service functions work correctly

### 4. Integration Testing (5 minutes)

**Test: Navigation Flow**
1. Navigate through all 6 tabs:
   - Diary → Goals → Habits → Calendar → Statistics → Profile
2. Verify smooth transitions
3. Verify data persists across navigation
4. Return to Calendar tab

**Expected Result**: All tabs accessible, data preserved

**Test: Real-time Updates**
1. Go to Goals screen
2. Add a new goal with a deadline
3. Navigate to Calendar tab
4. Verify new goal appears as event on deadline date

**Expected Result**: Calendar reflects new goals immediately

**Test: Dark Mode Consistency**
1. Enable dark mode
2. Navigate through all screens
3. Verify consistent dark theme throughout
4. Check Calendar, NotificationsCenter, all modals

**Expected Result**: Dark mode works on all screens

**Test: Mobile Responsive**
1. Open browser DevTools
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select iPhone or Android device
4. Test Calendar view
5. Verify navigation buttons stack properly
6. Test NotificationsCenter modal

**Expected Result**: All features work on mobile viewport

### 5. Regression Testing (3 minutes)

**Test: Phase 1 Features Still Work**
1. Test Export: Go to Profile → Click "Export My Data"
2. Test Templates: Go to Goals → Click "+" → Click "Browse Templates"
3. Test Charts: Go to Statistics → Verify all 5 charts render
4. Create new goal manually
5. Add tasks to goal
6. Mark task as complete

**Expected Result**: All Phase 1 features functional

**Test: Core CRUD Operations**
1. Create new goal
2. Edit goal title
3. Delete a task
4. Toggle task completion
5. Delete a goal (with confirmation)

**Expected Result**: All CRUD operations work without errors

## Common Issues & Solutions

**Issue**: Notifications not appearing
- **Solution**: Check browser permissions (chrome://settings/content/notifications)
- Verify notifications enabled in NotificationsCenter
- Try test notification from console

**Issue**: Calendar not loading
- **Solution**: Check browser console for errors
- Refresh page
- Verify goals have deadline dates set

**Issue**: Events not showing in calendar
- **Solution**: Make sure goals/tasks have due dates
- Check date format is valid
- Verify you're viewing the correct month

**Issue**: Dark mode calendar hard to read
- **Solution**: This is expected - custom CSS applied
- Check if colors visible on your monitor
- Try adjusting browser zoom

## Performance Checks

**Metrics to Monitor**:
- Page load time: < 3 seconds
- Calendar view switch: < 500ms
- Notification modal open: < 200ms
- Navigation between tabs: < 300ms
- No console errors during normal use

**Browser Console**: Should show no red errors during testing

## Test Completion Checklist

- [ ] Notifications permission granted
- [ ] Notification settings save correctly
- [ ] Calendar displays in all 3 views
- [ ] Events show with correct colors
- [ ] Overdue alerts work (if applicable)
- [ ] Navigation between all 6 tabs works
- [ ] Dark mode works throughout app
- [ ] Mobile responsive design verified
- [ ] Phase 1 features still functional
- [ ] No browser console errors

## Bug Reporting Template

If issues found, document:
```
**Feature**: [Notifications / Calendar / Recurring Tasks / Integration]
**Issue**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome 120 / Firefox 121 / Safari 17]
**Device**: [Desktop / Mobile]
**Screenshot**: [If applicable]
```

## Notes for Manual Testing

1. **Browser Notifications**: Require user permission - may not work in incognito/private mode
2. **Recurring Tasks**: Full UI pending - test via service layer for now
3. **Calendar Events**: Only goals/tasks with dates will appear
4. **Performance**: Large datasets may affect calendar rendering - this is expected

## Success Criteria

Phase 2 testing passes if:
- All 3 notification categories configurable
- Calendar displays all 3 views correctly
- Events color-coded and clickable
- Navigation works smoothly
- Dark mode functions properly
- No breaking changes to Phase 1
- Mobile responsive design maintained

**Estimated Testing Time**: 25-30 minutes for comprehensive test
**Quick Test Time**: 10 minutes for critical paths only
