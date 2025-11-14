import { useState, useEffect } from 'react';
import { subscriptionService, UserSubscription, UserUsage } from '../lib/subscriptionService';
import { useAuth } from '../lib/auth';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';

export default function BillingDashboardScreen({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPortal, setProcessingPortal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subscriptionData, usageData] = await Promise.all([
        subscriptionService.getUserSubscription(user.id),
        subscriptionService.getUserUsage(user.id)
      ]);

      setSubscription(subscriptionData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setProcessingPortal(true);
    try {
      const portalUrl = await subscriptionService.createPortalSession();
      
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        alert('Billing portal requires Stripe configuration. Add STRIPE_SECRET_KEY to enable this feature.');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      alert(error.message || 'Failed to open billing portal');
    } finally {
      setProcessingPortal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { icon: CheckCircle, text: 'Active', color: 'text-green-500 bg-green-500/10' },
      past_due: { icon: AlertCircle, text: 'Past Due', color: 'text-yellow-500 bg-yellow-500/10' },
      cancelled: { icon: XCircle, text: 'Cancelled', color: 'text-red-500 bg-red-500/10' },
      free: { icon: CheckCircle, text: 'Free', color: 'text-gray-500 bg-gray-500/10' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.free;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="p-8 rounded-[32px] glass-light dark:glass-dark">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  const isPro = subscription?.status === 'active' && subscription?.plan?.name === 'Pro';
  const limits = subscription?.plan?.limits;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-screen px-4 pt-16 pb-20">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white">Billing & Usage</h2>
            <p className="text-gray-300">Manage your subscription and track usage</p>
          </div>

          <div className="p-8 rounded-[32px] glass-light dark:glass-dark space-y-8">
            {/* Current Subscription */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Current Subscription
              </h3>
              <div className="p-6 rounded-2xl glass-light dark:glass-dark">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {subscription?.plan?.name || 'Free'} Plan
                    </h4>
                    {getStatusBadge(subscription?.status || 'free')}
                  </div>
                  {isPro && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${subscription?.billing_interval === 'yearly' 
                          ? subscription.plan?.price_yearly?.toFixed(2) 
                          : subscription.plan?.price_monthly?.toFixed(2)
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{subscription?.billing_interval === 'yearly' ? 'year' : 'month'}
                      </div>
                    </div>
                  )}
                </div>

                {isPro && subscription?.current_period_end && (
                  <div className="flex items-center gap-2 p-4 mt-4 rounded-xl bg-blue-500/10">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.cancel_at_period_end ? 'Subscription ends on' : 'Next billing date'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(subscription.current_period_end)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            {usage && limits && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Usage Statistics
                </h3>
                <div className="space-y-4">
                  {/* Habits Usage */}
                  <div className="p-6 rounded-2xl glass-light dark:glass-dark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">Habits</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {usage.habits_count} / {limits.habits === -1 ? 'Unlimited' : limits.habits}
                      </span>
                    </div>
                    {limits.habits !== -1 && (
                      <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
                        <div 
                          className="h-full transition-all bg-blue-500 rounded-full"
                          style={{ width: `${getUsagePercentage(usage.habits_count, limits.habits)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Goals Usage */}
                  <div className="p-6 rounded-2xl glass-light dark:glass-dark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">Goals</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {usage.goals_count} / {limits.goals === -1 ? 'Unlimited' : limits.goals}
                      </span>
                    </div>
                    {limits.goals !== -1 && (
                      <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
                        <div 
                          className="h-full transition-all bg-purple-500 rounded-full"
                          style={{ width: `${getUsagePercentage(usage.goals_count, limits.goals)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl glass-light dark:glass-dark">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Templates Used</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usage.templates_used}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl glass-light dark:glass-dark">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Exports</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {usage.exports_count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isPro && (
                <button
                  onClick={handleManageBilling}
                  disabled={processingPortal}
                  className="w-full py-4 text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {processingPortal ? (
                    <>
                      <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="inline w-5 h-5 mr-2" />
                      Manage Billing
                      <ArrowUpRight className="inline w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-4 text-sm font-semibold transition-all rounded-2xl glass-light dark:glass-dark text-gray-900 dark:text-white hover:scale-[1.02] active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
