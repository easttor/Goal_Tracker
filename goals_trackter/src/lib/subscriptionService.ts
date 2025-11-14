import { supabase } from './supabase';

export interface SubscriptionPlan {
  id: number;
  name: string;
  stripe_product_id: string | null;
  stripe_price_monthly_id: string | null;
  stripe_price_yearly_id: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  limits: {
    habits: number;
    goals: number;
    templates: number;
    advanced_analytics: boolean;
    export: boolean;
    photos: boolean;
    custom_themes: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  billing_interval: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface UserUsage {
  id: string;
  user_id: string;
  habits_count: number;
  goals_count: number;
  templates_used: number;
  exports_count: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

class SubscriptionService {
  // Get all available plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    
    if (data && data.plan) {
      return {
        ...data,
        plan: Array.isArray(data.plan) ? data.plan[0] : data.plan
      } as UserSubscription;
    }
    
    return data as UserSubscription | null;
  }

  // Get user's usage stats
  async getUserUsage(userId: string): Promise<UserUsage | null> {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Check if user can perform an action based on limits
  async canPerformAction(
    userId: string,
    action: 'habits' | 'goals' | 'templates' | 'export' | 'photos' | 'advanced_analytics'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getUserUsage(userId);

    if (!subscription || !subscription.plan) {
      return { allowed: false, reason: 'No subscription found' };
    }

    const limits = subscription.plan.limits;

    // Check boolean limits
    if (action === 'export' && !limits.export) {
      return { allowed: false, reason: 'Export is a Pro feature' };
    }
    if (action === 'photos' && !limits.photos) {
      return { allowed: false, reason: 'Progress photos are a Pro feature' };
    }
    if (action === 'advanced_analytics' && !limits.advanced_analytics) {
      return { allowed: false, reason: 'Advanced analytics is a Pro feature' };
    }

    // Check count limits
    if (usage) {
      if (action === 'habits' && limits.habits !== -1 && usage.habits_count >= limits.habits) {
        return { allowed: false, reason: `You've reached the limit of ${limits.habits} habits on the Free plan` };
      }
      if (action === 'goals' && limits.goals !== -1 && usage.goals_count >= limits.goals) {
        return { allowed: false, reason: `You've reached the limit of ${limits.goals} goals on the Free plan` };
      }
      if (action === 'templates' && limits.templates !== -1 && usage.templates_used >= limits.templates) {
        return { allowed: false, reason: `You've used ${limits.templates} template slots on the Free plan` };
      }
    }

    return { allowed: true };
  }

  // Increment usage count
  async incrementUsage(userId: string, usageType: 'habits' | 'goals' | 'templates' | 'exports'): Promise<void> {
    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_usage_type: usageType
    });

    if (error) throw error;
  }

  // Decrement usage count
  async decrementUsage(userId: string, usageType: 'habits' | 'goals'): Promise<void> {
    const { error } = await supabase.rpc('decrement_usage', {
      p_user_id: userId,
      p_usage_type: usageType
    });

    if (error) throw error;
  }

  // Create checkout session
  async createCheckoutSession(planId: number, interval: 'monthly' | 'yearly'): Promise<string> {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planId, interval }
    });

    if (error) throw error;
    
    if (data?.data?.checkoutUrl) {
      return data.data.checkoutUrl;
    }
    
    throw new Error('Failed to create checkout session');
  }

  // Create customer portal session
  async createPortalSession(): Promise<string | null> {
    const { data, error } = await supabase.functions.invoke('customer-portal');

    if (error) throw error;
    
    return data?.data?.portalUrl || null;
  }

  // Check if user is on Pro plan
  async isProUser(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.status === 'active' && subscription?.plan?.name === 'Pro';
  }

  // Get remaining usage counts
  async getRemainingUsage(userId: string): Promise<{
    habits: number | 'unlimited';
    goals: number | 'unlimited';
  }> {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getUserUsage(userId);

    if (!subscription || !subscription.plan || !usage) {
      return { habits: 0, goals: 0 };
    }

    const limits = subscription.plan.limits;

    return {
      habits: limits.habits === -1 ? 'unlimited' : Math.max(0, limits.habits - usage.habits_count),
      goals: limits.goals === -1 ? 'unlimited' : Math.max(0, limits.goals - usage.goals_count),
    };
  }
}

export const subscriptionService = new SubscriptionService();
