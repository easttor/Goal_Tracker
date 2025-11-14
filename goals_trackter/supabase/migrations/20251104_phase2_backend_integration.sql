-- Migration: Add user preferences table for notification settings
-- This migration moves notification settings from client localStorage to server
-- Run this manually in Supabase SQL Editor or via migration system

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Notification preferences
  notifications_enabled BOOLEAN DEFAULT true,
  deadline_notifications BOOLEAN DEFAULT true,
  deadline_1day_before BOOLEAN DEFAULT true,
  deadline_3days_before BOOLEAN DEFAULT true,
  deadline_1week_before BOOLEAN DEFAULT true,
  
  habit_reminders_enabled BOOLEAN DEFAULT true,
  habit_reminder_time TIME DEFAULT '09:00:00',
  
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day INTEGER DEFAULT 1,
  
  achievement_notifications BOOLEAN DEFAULT true,
  
  -- Calendar preferences
  calendar_default_view TEXT DEFAULT 'month',
  calendar_week_start INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add recurring task fields to existing tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS recurring_pattern JSONB,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS next_occurrence_date DATE,
  ADD COLUMN IF NOT EXISTS last_occurrence_date DATE;

-- Create index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_next_occurrence 
  ON tasks(next_occurrence_date) 
  WHERE next_occurrence_date IS NOT NULL;

COMMENT ON TABLE user_preferences IS 'User notification and calendar preferences';
COMMENT ON COLUMN tasks.recurring_pattern IS 'JSONB field storing recurring task pattern';
