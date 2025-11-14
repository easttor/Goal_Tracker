# Goals Tracker App - Manual Testing Guide

## Deployed URL
**Production**: https://g8ib40poqg3g.space.minimax.io

## Quick Test Access
**Demo Account**: Click "Try Demo Account" button on the login screen
- This will automatically create and sign you in to a demo account with pre-loaded sample data

## Testing Checklist

### 1. Authentication Flow
- [ ] Page loads without errors
- [ ] Login screen displays with email/password fields
- [ ] "Try Demo Account" button works (creates/logs into demo account)
- [ ] Can create new account with email/password
- [ ] Can log in with existing account
- [ ] Error messages display for invalid credentials

### 2. Navigation
- [ ] Bottom navigation bar displays with 4 tabs: Diary, Goals, Statistics, Timeline
- [ ] Clicking each tab navigates to the correct screen
- [ ] Active tab is highlighted in blue
- [ ] Navigation is smooth without page reloads

### 3. Diary Screen
- [ ] Header shows "Daily Report" with current date
- [ ] "Goals Overview" section displays goal cards in a 2-column grid
- [ ] Each goal card shows: title, icon, color gradient, progress bar, percentage
- [ ] "Today's Tasks" section lists tasks due today
- [ ] Clicking task checkbox toggles completion status
- [ ] Completed tasks show checkmark and styling changes
- [ ] "Daily Entry" textarea is present with "Save Entry" button
- [ ] Clicking a goal card navigates to Goals screen and highlights that goal

### 4. Goals Screen
- [ ] Header shows "My Goals" with search icon
- [ ] Filter buttons display: All, In Progress, Completed
- [ ] Default goals display (Fitness Journey, Read 52 Books)
- [ ] Each goal card shows:
  - [ ] Goal image (600x400 placeholder)
  - [ ] Title, description, icon
  - [ ] Progress bar with task count
  - [ ] List of tasks with checkboxes and due dates
  - [ ] "Add Task" button
  - [ ] Edit and Delete buttons
- [ ] Floating "+" button appears in bottom right
- [ ] Goal cards display correctly with proper spacing

### 5. Goal CRUD Operations
- [ ] Click "+" button opens "Add New Goal" modal
- [ ] Modal has all fields: Title, Description, Image URL, Icon, Color, Deadline
- [ ] Icon dropdown shows 9 options (Target, BookOpen, Dumbbell, etc.)
- [ ] Color dropdown shows 5 options (Blue, Purple, Green, Red, Yellow)
- [ ] Submit button creates new goal
- [ ] New goal appears in the list immediately (real-time)
- [ ] Click Edit button opens "Edit Goal" modal with pre-filled data
- [ ] Editing and submitting updates the goal
- [ ] Click Delete button opens confirmation modal
- [ ] Confirming deletion removes the goal
- [ ] Cancel buttons close modals without changes

### 6. Task Management
- [ ] Click "Add Task" button on a goal opens "Add New Task" modal
- [ ] Modal has fields: Task text, Due Date
- [ ] Submit creates new task
- [ ] New task appears in goal's task list
- [ ] Click checkbox toggles task completion
- [ ] Completed tasks show checkmark and line-through styling
- [ ] Hover over task shows edit and delete icons
- [ ] Click edit icon opens "Edit Task" modal with pre-filled data
- [ ] Editing and submitting updates the task
- [ ] Click delete icon opens confirmation modal
- [ ] Confirming deletion removes the task

### 7. Statistics Screen
- [ ] Header shows "Progress Report"
- [ ] Filter tabs: This Week, This Month, All Time
- [ ] "Goals Achieved" circular progress displays (82%)
- [ ] "Tasks Completed" circular progress displays (95%)
- [ ] "Daily Activity" section shows bar chart
- [ ] Bar chart has 7 bars for days of the week (M-S)
- [ ] Chart shows task count: 35/40 Tasks

### 8. Timeline Screen
- [ ] Header shows "Timeline" with bell icon
- [ ] "Recent Achievements" section displays
- [ ] 4 achievement items show with:
  - [ ] Colored icon circles (yellow, red, blue, green)
  - [ ] Achievement descriptions
  - [ ] Timestamps
- [ ] Achievement items:
  - [ ] "Completed Goal: Launch Personal Website"
  - [ ] "Achieved a 7-day task completion streak"
  - [ ] "Finished Task: Draft project proposal"
  - [ ] "Wrote 5 diary entries this week"

### 9. Real-time Updates
- [ ] Adding a goal updates the display immediately
- [ ] Editing a goal updates the display immediately
- [ ] Deleting a goal updates the display immediately
- [ ] Adding a task updates the display immediately
- [ ] Toggling task completion updates immediately
- [ ] Changes reflect in both Diary and Goals screens

### 10. Responsive Design
- [ ] Layout is mobile-first and responsive
- [ ] Bottom navigation stays fixed at bottom
- [ ] Content scrolls properly above navigation
- [ ] Modals display centered with backdrop
- [ ] Modal backdrop is semi-transparent
- [ ] Clicking backdrop closes modal
- [ ] All buttons and interactions work on mobile

### 11. Error Handling & Validation
- [ ] Try to add goal with empty title - form validation prevents submission
- [ ] Try to add task with empty text - form validation prevents submission
- [ ] Image error handling works (fallback to placeholder images)
- [ ] No JavaScript errors in browser console
- [ ] Network errors are handled gracefully

## Expected Behavior

### Default Sample Data
When using the demo account or a new account, you should see:
1. **Fitness Journey** goal:
   - Blue color with Dumbbell icon
   - 3 tasks: 2 due today, 1 due tomorrow
   - 1 task already completed (Buy new running shoes)
   - Deadline: 2025-12-31

2. **Read 52 Books** goal:
   - Purple color with BookOpen icon
   - 2 tasks: 1 due today, 1 due tomorrow
   - 0 tasks completed initially
   - Deadline: 2025-12-31

### Progress Calculation
- Progress percentage = (completed tasks / total tasks) * 100
- Displayed on goal cards in both Diary and Goals screens

### Task Due Dates
- "Today's Tasks" in Diary screen only shows tasks where dueDate matches current date
- Tasks display in task list regardless of due date

## Known Features
- Statistics and Timeline screens show static demo data
- Daily Entry save button is present but doesn't persist data yet
- Search icon in Goals screen is visual only (no search functionality)
- Filter buttons (All, In Progress, Completed) are visual only

## Browser Console Checks
Open browser DevTools (F12) and check:
- [ ] No critical errors in Console tab
- [ ] Network tab shows successful API calls to Supabase
- [ ] Authentication token is present in request headers
- [ ] Real-time subscriptions are established

## Testing Tips
1. Use the demo account for quick testing
2. Open browser DevTools to monitor network requests
3. Test task completion toggling multiple times to verify real-time updates
4. Try creating goals with different colors and icons
5. Test modal interactions (open, close, cancel, submit)
6. Verify date formatting throughout the app
