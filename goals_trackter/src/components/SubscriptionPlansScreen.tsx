import { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionPlan, UserSubscription } from '../lib/subscriptionService';
import { useAuth } from '../lib/auth';
import { Check, Sparkles, Loader2, X } from 'lucide-react';

export default function SubscriptionPlansScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<{ id: number; interval: string } | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getUserSubscription(user.id)
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number, interval: 'monthly' | 'yearly') => {
    if (!user) return;

    setProcessingPlan({ id: planId, interval });

    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession(planId, interval);
      
      if (checkoutUrl.includes('subscription=success')) {
        // Mock success for development
        alert('Subscription feature ready! Add Stripe API keys to process real payments.');
        await loadData();
      } else {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error.message || 'Failed to start subscription process');
    } finally {
      setProcessingPlan(null);
    }
  };

  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number | null) => {
    if (!yearlyPrice) return 0;
    const yearlyAsMonthly = yearlyPrice / 12;
    const savings = ((monthlyPrice - yearlyAsMonthly) / monthlyPrice) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-black">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isPro = currentSubscription?.status === 'active' && currentSubscription?.plan?.name === 'Pro';

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pb-32">
      {/* Header */}
      <div className="px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full glass-light dark:glass-dark">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium Features</span>
        </div>
        
        <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Unlock unlimited potential with Goals Tracker Pro
        </p>

        {/* Current Plan Badge */}
        {currentSubscription && (
          <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full glass-light dark:glass-dark">
            <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Plan: {currentSubscription.plan?.name || 'Free'}
            </span>
          </div>
        )}
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center px-4 mb-8">
        <div className="inline-flex p-1 rounded-full glass-light dark:glass-dark">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingInterval === 'monthly'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingInterval === 'yearly'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            {plans.find(p => p.name === 'Pro')?.price_yearly && (
              <span className="ml-2 text-xs text-green-400">
                Save {calculateYearlySavings(
                  plans.find(p => p.name === 'Pro')?.price_monthly || 0,
                  plans.find(p => p.name === 'Pro')?.price_yearly || 0
                )}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid max-w-5xl gap-6 px-4 mx-auto md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = currentSubscription?.plan?.id === plan.id;
          const isFree = plan.name === 'Free';
          const price = billingInterval === 'yearly' && plan.price_yearly 
            ? (plan.price_yearly / 12).toFixed(2)
            : plan.price_monthly.toFixed(2);
          const isProcessing = processingPlan?.id === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative p-8 rounded-[32px] transition-all ${
                plan.name === 'Pro'
                  ? 'glass-light dark:glass-dark ring-2 ring-blue-500/50 shadow-xl'
                  : 'glass-light dark:glass-dark'
              }`}
            >
              {/* Pro Badge */}
              {plan.name === 'Pro' && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    POPULAR
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                {billingInterval === 'yearly' && !isFree && plan.price_yearly && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ${plan.price_yearly.toFixed(2)} billed annually
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="mb-8 space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {isFree ? (
                isCurrent ? (
                  <button
                    disabled
                    className="w-full py-4 text-sm font-semibold text-gray-500 transition-all rounded-2xl glass-light dark:glass-dark"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 text-sm font-semibold text-gray-500 transition-all rounded-2xl glass-light dark:glass-dark"
                  >
                    Free Forever
                  </button>
                )
              ) : isCurrent && isPro ? (
                <button
                  disabled
                  className="w-full py-4 text-sm font-semibold text-white transition-all bg-green-500 rounded-2xl"
                >
                  <Check className="inline w-5 h-5 mr-2" />
                  Active Subscription
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id, billingInterval)}
                  disabled={isProcessing}
                  className="w-full py-4 text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Upgrade to {plan.name}</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="max-w-3xl px-4 mx-auto mt-16">
        <div className="p-8 rounded-[32px] glass-light dark:glass-dark">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            What happens when I upgrade?
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>All limits are removed immediately after upgrading to Pro.</p>
            <p>You can cancel anytime and keep Pro features until the end of your billing period.</p>
            <p>Your data is always safe and accessible, even if you downgrade to Free.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
