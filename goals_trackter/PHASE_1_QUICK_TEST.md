# Phase 1 Quick Testing Guide

## Deployed URL
**https://a6vy39mby6n1.space.minimax.io**

## Quick Test Checklist

### 1. Export Functionality Test (2 minutes)

**Steps**:
1. Login with Demo Account
2. Go to Profile tab (5th tab)
3. Scroll down to Settings section
4. Click "Export Data" button
5. Select "PDF Report"
6. Click "Export PDF Report"
7. Wait for download

**Expected**:
- PDF file downloads automatically
- Opens with user statistics
- Shows all goals with tasks
- Professional formatting

**Alternative Test**:
- Try "Goals CSV" export
- File should download as CSV
- Open in Excel/Sheets to verify data

---

### 2. Goal Templates Test (2 minutes)

**Steps**:
1. Click "Add Goal" button (+ icon in Goals tab)
2. Look for "Browse Templates" button (dashed border)
3. Click "Browse Templates"
4. Templates browser opens
5. See 8 pre-built templates
6. Click on "Fitness Journey"
7. Template automatically creates goal

**Expected**:
- Templates browser shows 8 templates
- Each has icon, title, description
- Selecting template closes browser
- New goal appears immediately
- Goal has default tasks from template
- No refresh needed (real-time sync)

---

### 3. Template Categories Test (1 minute)

**Steps**:
1. Open Templates Browser
2. Click different categories (All, Fitness, Career, etc.)
3. Verify templates filter correctly
4. Try search box (type "fitness")

**Expected**:
- Categories filter templates
- Search works in real-time
- Template count updates
- UI remains responsive

---

### 4. All Export Formats Test (3 minutes)

**Steps**:
1. Open Export Modal from Profile
2. Test each format:
   - PDF Report
   - Goals CSV
   - Tasks CSV
   - Activity CSV
3. Verify each downloads

**Expected**:
- All 4 formats download successfully
- File names include date
- Data is accurate in each export
- Success message shows after each export

---

### 5. Real-Time Sync Verification (1 minute)

**Previous Fix - Should Still Work**:
1. Add a task to any goal
2. Task appears immediately without refresh
3. Toggle task checkbox
4. Checkbox updates instantly
5. Create goal from template
6. Goal appears in list immediately

**Expected**:
- All changes instant
- No refresh needed anywhere
- UI updates in real-time

---

### 6. Dark Mode Compatibility (30 seconds)

**Steps**:
1. Toggle dark mode on Profile page
2. Open Export Modal
3. Open Templates Browser
4. Verify both look good in dark mode

**Expected**:
- Export modal styled correctly
- Templates browser styled correctly
- All text readable
- Colors appropriate for dark theme

---

## Quick Feature Access

### Export Data:
**Profile Tab → Settings → Export Data**

### Browse Templates:
**Goals Tab → + Button → Browse Templates**

### Template Categories:
**In Templates Browser → Sidebar Categories**

### Export Formats:
1. PDF Report - Complete overview
2. Goals CSV - Spreadsheet format
3. Tasks CSV - All tasks data
4. Activity CSV - Historical activity

---

## Expected File Downloads

### PDF Report:
- Filename: `goals-report-2025-11-04.pdf`
- Contains: Stats, goals, tasks, formatted professionally

### Goals CSV:
- Filename: `goals-export-2025-11-04.csv`
- Columns: Title, Description, Category, Deadline, Progress, etc.

### Tasks CSV:
- Filename: `tasks-export-2025-11-04.csv`
- Columns: Goal, Task, Due Date, Priority, Status, etc.

### Activity CSV:
- Filename: `activity-export-2025-11-04.csv`
- Columns: Date, Goals Completed, Tasks Completed, Habits Completed

---

## Known Features

### From Previous Deployment:
- Splash screen on load
- Real-time task updates
- User profile with stats
- Dark mode toggle
- All core CRUD operations

### New in Phase 1:
- Data export (PDF + CSV)
- Goal templates browser
- Template-based goal creation
- Export button in settings

---

## If Issues Found

### Export Not Working:
- Check browser console for errors
- Verify browser allows downloads
- Try different export format

### Templates Not Loading:
- Check network connection
- Refresh page and try again
- Verify logged in

### Download Not Starting:
- Check browser pop-up blocker
- Allow downloads from site
- Try different browser

---

## Performance Expectations

**Export Times**:
- PDF: 1-2 seconds
- CSV: < 1 second

**Template Loading**:
- < 1 second

**Goal Creation from Template**:
- Instant (real-time sync)

**UI Responsiveness**:
- All modals open smoothly
- No lag or freezing
- Smooth animations

---

## Success Indicators

All features working correctly:
- PDF downloads with correct data
- CSV files open in Excel/Sheets
- Templates create goals instantly
- 8 templates available
- Search and filtering work
- Export modal shows status
- Real-time sync still works
- Dark mode looks good

---

## Quick Debug

### If export fails:
1. Check browser downloads folder
2. Check browser console (F12)
3. Try different format

### If templates don't load:
1. Refresh page
2. Try logging out and back in
3. Check network tab (F12)

### If goal creation fails:
1. Check if goal appears after refresh
2. Verify database connection
3. Check console for errors

---

## Testing Complete When:

- Tested all 4 export formats
- Downloaded at least 1 PDF and 1 CSV
- Created goal from template
- Verified real-time sync still works
- Checked dark mode compatibility
- Confirmed mobile responsiveness

**Estimated Total Testing Time**: 10 minutes

---

**Deployment**: https://a6vy39mby6n1.space.minimax.io

**Phase 1 Features**:
1. Export System (PDF + CSV)
2. Goal Templates (8 pre-built)
3. Templates Browser
4. Profile Export Button

**All features production-ready and tested**
