-- Migration: habits_enhancements_v2
-- Created at: 1762383401

-- Migration: Enhance habits with advanced features
-- Categories, colors, reminders, templates, achievements, progress tracking

-- 1. Add new columns to habits table
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'wellness',
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'purple',
  ADD COLUMN IF NOT EXISTS reminder_time TIME,
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS notes_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS photos_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pause_reason TEXT,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'target';

-- Add check constraints
ALTER TABLE habits
  ADD CONSTRAINT check_category CHECK (category IN (
    'health', 'productivity', 'learning', 'wellness', 'fitness', 
    'nutrition', 'mindfulness', 'social', 'creative', 'finance'
  )),
  ADD CONSTRAINT check_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  ADD CONSTRAINT check_color CHECK (color IN (
    'purple', 'blue', 'green', 'orange', 'red', 'pink', 'teal', 'indigo', 'yellow', 'cyan'
  ));

-- Create index for category and color filtering
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_habits_color ON habits(color);
CREATE INDEX IF NOT EXISTS idx_habits_reminder ON habits(reminder_time) WHERE reminder_enabled = true;

-- 2. Create habit_templates table
CREATE TABLE IF NOT EXISTS habit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT 'purple',
  frequency TEXT DEFAULT 'daily',
  difficulty_level TEXT DEFAULT 'beginner',
  target_count INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints for templates
ALTER TABLE habit_templates
  ADD CONSTRAINT check_template_category CHECK (category IN (
    'health', 'productivity', 'learning', 'wellness', 'fitness', 
    'nutrition', 'mindfulness', 'social', 'creative', 'finance'
  )),
  ADD CONSTRAINT check_template_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

-- Enable RLS for templates
ALTER TABLE habit_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (public read)
CREATE POLICY "Anyone can view public templates"
  ON habit_templates FOR SELECT
  USING (is_public = true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_habit_templates_category ON habit_templates(category);

-- Insert default habit templates
INSERT INTO habit_templates (name, description, category, icon, color, frequency, difficulty_level) VALUES
  ('Morning Exercise', '30 minutes of physical activity to start your day', 'fitness', 'activity', 'orange', 'daily', 'beginner'),
  ('Read for 20 Minutes', 'Daily reading habit to expand knowledge', 'learning', 'book-open', 'blue', 'daily', 'beginner'),
  ('Meditate', '10 minutes of mindfulness meditation', 'mindfulness', 'brain', 'purple', 'daily', 'beginner'),
  ('Drink 8 Glasses of Water', 'Stay hydrated throughout the day', 'health', 'droplet', 'cyan', 'daily', 'beginner'),
  ('Healthy Breakfast', 'Start the day with a nutritious meal', 'nutrition', 'apple', 'green', 'daily', 'beginner'),
  ('Journal', 'Write thoughts and reflections', 'mindfulness', 'pen-tool', 'indigo', 'daily', 'intermediate'),
  ('Learn a New Skill', 'Dedicate time to learning something new', 'learning', 'lightbulb', 'yellow', 'daily', 'intermediate'),
  ('Connect with Friends', 'Reach out to someone meaningful', 'social', 'users', 'pink', 'weekly', 'beginner'),
  ('Budget Review', 'Review and plan finances', 'finance', 'dollar-sign', 'green', 'weekly', 'intermediate'),
  ('Creative Project', 'Work on a creative endeavor', 'creative', 'palette', 'red', 'weekly', 'intermediate')
ON CONFLICT DO NOTHING;

-- 3. Create habit_achievements table
CREATE TABLE IF NOT EXISTS habit_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'award',
  badge_color TEXT DEFAULT 'gold',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE habit_achievements
  ADD CONSTRAINT check_achievement_type CHECK (achievement_type IN (
    'streak_7', 'streak_30', 'streak_100', 'streak_365',
    'completion_50', 'completion_100', 'completion_500',
    'perfect_week', 'perfect_month', 'comeback'
  ));

-- Enable RLS
ALTER TABLE habit_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
  ON habit_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON habit_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habit_achievements_user ON habit_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_achievements_habit ON habit_achievements(habit_id);

-- 4. Create habit_notes table
CREATE TABLE IF NOT EXISTS habit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completion_date DATE NOT NULL,
  note TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

-- Enable RLS
ALTER TABLE habit_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notes"
  ON habit_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON habit_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON habit_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON habit_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habit_notes_habit ON habit_notes(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_notes_date ON habit_notes(completion_date);

-- 5. Create habit_progress_photos table
CREATE TABLE IF NOT EXISTS habit_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habit_progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own photos"
  ON habit_progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON habit_progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON habit_progress_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habit_photos_habit ON habit_progress_photos(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_photos_user ON habit_progress_photos(user_id);

-- 6. Add notes column to habit_completions
ALTER TABLE habit_completions
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS mood TEXT;

-- 7. Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_habit_achievements()
RETURNS TRIGGER AS $$
DECLARE
  current_streak INTEGER;
  total_completions INTEGER;
BEGIN
  -- Get current streak
  SELECT h.current_streak INTO current_streak
  FROM habits h
  WHERE h.id = NEW.habit_id;

  -- Get total completions
  SELECT COUNT(*) INTO total_completions
  FROM habit_completions
  WHERE habit_id = NEW.habit_id;

  -- Award streak achievements
  IF current_streak = 7 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'streak_7', '7-Day Streak', 'Completed habit for 7 days in a row', 'flame', 'bronze')
    ON CONFLICT DO NOTHING;
  END IF;

  IF current_streak = 30 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'streak_30', '30-Day Streak', 'Completed habit for 30 days in a row', 'flame', 'silver')
    ON CONFLICT DO NOTHING;
  END IF;

  IF current_streak = 100 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'streak_100', '100-Day Streak', 'Completed habit for 100 days in a row', 'flame', 'gold')
    ON CONFLICT DO NOTHING;
  END IF;

  IF current_streak = 365 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'streak_365', '365-Day Streak', 'Completed habit for a full year', 'trophy', 'platinum')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Award completion count achievements
  IF total_completions = 50 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'completion_50', '50 Completions', 'Completed habit 50 times', 'check-circle', 'bronze')
    ON CONFLICT DO NOTHING;
  END IF;

  IF total_completions = 100 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'completion_100', '100 Completions', 'Completed habit 100 times', 'check-circle', 'silver')
    ON CONFLICT DO NOTHING;
  END IF;

  IF total_completions = 500 THEN
    INSERT INTO habit_achievements (habit_id, user_id, achievement_type, title, description, icon, badge_color)
    VALUES (NEW.habit_id, NEW.user_id, 'completion_500', '500 Completions', 'Completed habit 500 times', 'star', 'gold')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for achievement checking
DROP TRIGGER IF EXISTS trigger_check_achievements ON habit_completions;
CREATE TRIGGER trigger_check_achievements
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_habit_achievements();

-- 8. Add updated_at trigger for new tables
CREATE TRIGGER habit_templates_updated_at
  BEFORE UPDATE ON habit_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER habit_notes_updated_at
  BEFORE UPDATE ON habit_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();;