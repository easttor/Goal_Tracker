-- Subscription System Migration
-- Creates tables for subscription management, usage tracking, and feature gating

-- 1. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_product_id TEXT,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id INTEGER,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  billing_interval TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Usage Tracking Table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  habits_count INTEGER DEFAULT 0,
  goals_count INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  exports_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (publicly readable)
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Plans are insertable by service role" ON subscription_plans
  FOR INSERT WITH CHECK (auth.role() IN ('service_role', 'anon'));

CREATE POLICY "Plans are updatable by service role" ON subscription_plans
  FOR UPDATE USING (auth.role() IN ('service_role', 'anon'));

-- RLS Policies for user_subscriptions (user-specific)
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

-- RLS Policies for user_usage (user-specific)
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('service_role', 'anon'));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, limits) VALUES
  ('Free', 0.00, 0.00, 
    '["3 habits maximum", "3 goals maximum", "Basic analytics", "Limited templates (3)", "Basic statistics"]'::jsonb,
    '{"habits": 3, "goals": 3, "templates": 3, "advanced_analytics": false, "export": false, "photos": false, "custom_themes": false}'::jsonb
  ),
  ('Pro', 4.99, 49.99,
    '["Unlimited habits", "Unlimited goals", "Advanced analytics", "All templates (10)", "Progress photos", "Export functionality", "Custom themes", "Detailed insights", "Priority support"]'::jsonb,
    '{"habits": -1, "goals": -1, "templates": -1, "advanced_analytics": true, "export": true, "photos": true, "custom_themes": true}'::jsonb
  );

-- Function to create default user usage record
CREATE OR REPLACE FUNCTION create_user_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_usage (user_id, habits_count, goals_count, templates_used, exports_count)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user usage on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_usage ON auth.users;
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_usage();

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id INTEGER;
BEGIN
  -- Get the Free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
  
  -- Create free subscription for new user
  INSERT INTO user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, free_plan_id, 'free')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default subscription on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);

-- Function to update usage counts
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS void AS $$
BEGIN
  IF p_usage_type = 'habits' THEN
    UPDATE user_usage 
    SET habits_count = habits_count + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_usage_type = 'goals' THEN
    UPDATE user_usage 
    SET goals_count = goals_count + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_usage_type = 'templates' THEN
    UPDATE user_usage 
    SET templates_used = templates_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_usage_type = 'exports' THEN
    UPDATE user_usage 
    SET exports_count = exports_count + 1, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement usage counts
CREATE OR REPLACE FUNCTION decrement_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS void AS $$
BEGIN
  IF p_usage_type = 'habits' THEN
    UPDATE user_usage 
    SET habits_count = GREATEST(habits_count - 1, 0), updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_usage_type = 'goals' THEN
    UPDATE user_usage 
    SET goals_count = GREATEST(goals_count - 1, 0), updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
