# Goals Tracker - Enhanced Database Schema Design

## Overview
Migrating from JSONB tasks array to relational tables for better querying, performance, and feature support.

## New Tables

### 1. goals (Enhanced)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text)
- description (text)
- icon (text)
- color (text)
- image_url (text)
- deadline (date)
- category (text) -- NEW: Health, Career, Personal, etc.
- is_recurring (boolean) -- NEW: For recurring goals
- recurrence_pattern (text) -- NEW: daily, weekly, monthly
- is_habit (boolean) -- NEW: For habit tracking
- status (text) -- NEW: active, completed, archived
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. tasks (NEW - Separate Table)
```sql
- id (uuid, primary key)
- goal_id (uuid, references goals.id, cascade delete)
- user_id (uuid, references auth.users)
- text (text)
- description (text) -- NEW: Detailed description
- due_date (date)
- is_complete (boolean)
- priority (text) -- NEW: high, medium, low
- category (text) -- NEW: Task category/tag
- parent_task_id (uuid) -- NEW: For subtasks
- depends_on_task_id (uuid) -- NEW: Task dependencies
- order_index (integer) -- NEW: For ordering
- estimated_minutes (integer) -- NEW: Time estimation
- actual_minutes (integer) -- NEW: Actual time spent
- created_at (timestamp)
- updated_at (timestamp)
- completed_at (timestamp) -- NEW: When completed
```

### 3. milestones (NEW)
```sql
- id (uuid, primary key)
- goal_id (uuid, references goals.id, cascade delete)
- user_id (uuid, references auth.users)
- title (text)
- description (text)
- target_value (numeric) -- e.g., 50 for 50% progress
- current_value (numeric)
- unit (text) -- e.g., pages, miles, kg
- is_achieved (boolean)
- achieved_at (timestamp)
- order_index (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. habits (NEW)
```sql
- id (uuid, primary key)
- goal_id (uuid, references goals.id, cascade delete)
- user_id (uuid, references auth.users)
- title (text)
- description (text)
- frequency (text) -- daily, weekly, custom
- target_count (integer) -- Times per period
- current_streak (integer)
- best_streak (integer)
- last_completed_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5. habit_completions (NEW)
```sql
- id (uuid, primary key)
- habit_id (uuid, references habits.id, cascade delete)
- user_id (uuid, references auth.users)
- completion_date (date)
- note (text)
- created_at (timestamp)
```

### 6. task_templates (NEW)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users, nullable for global templates)
- name (text)
- description (text)
- category (text)
- template_data (jsonb) -- Structured task data
- is_public (boolean) -- Global vs personal templates
- usage_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### 7. achievements (NEW)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- achievement_type (text) -- streak_7, goals_10, etc.
- title (text)
- description (text)
- icon (text)
- earned_at (timestamp)
- created_at (timestamp)
```

### 8. comments (NEW)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- goal_id (uuid, references goals.id, nullable)
- task_id (uuid, references tasks.id, nullable)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Migration Strategy

1. Create new tables alongside existing structure
2. Migrate existing JSONB tasks to new tasks table
3. Keep backward compatibility during transition
4. Update application layer to use new schema
5. Remove old JSONB column after verification

## RLS Policies

All tables will have RLS policies:
- Users can only access their own data
- Shared goals (future feature) require special policies
- Public templates are readable by all

## Indexes for Performance

```sql
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_task ON tasks(parent_task_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
```
