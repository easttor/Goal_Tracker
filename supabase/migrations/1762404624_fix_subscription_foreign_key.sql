-- Migration: fix_subscription_foreign_key
-- Created at: 1762404624

-- Fix subscription system foreign key relationship

-- Add foreign key constraint for plan_id
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_plan_id_fkey
FOREIGN KEY (plan_id)
REFERENCES subscription_plans(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);;