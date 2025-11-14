import { useState } from 'react';
import { 
  X, Search, ChevronRight, HelpCircle, BookOpen, Zap, Shield, 
  Mail, MessageCircle, Star, Sparkles, Check, Crown
} from 'lucide-react';

interface HelpScreenProps {
  onClose: () => void;
}

export default function HelpScreen({ onClose }: HelpScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Zap },
    { id: 'features', title: 'Features Guide', icon: BookOpen },
    { id: 'free-vs-pro', title: 'Free vs Pro', icon: Crown },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: Shield },
    { id: 'tips', title: 'Tips & Best Practices', icon: Star },
    { id: 'support', title: 'Contact Support', icon: MessageCircle },
  ];

  const faqItems = [
    {
      q: 'How do I upgrade to Pro?',
      a: 'Go to Profile > Subscription, choose Pro plan, select monthly or yearly billing, and complete the secure checkout process. Your Pro features activate immediately.'
    },
    {
      q: 'What happens if I cancel my subscription?',
      a: 'You keep Pro features until the end of your billing period. After that, you automatically return to the Free plan. All your data remains safe and accessible.'
    },
    {
      q: 'Can I downgrade to Free plan?',
      a: 'Yes! Cancel your subscription anytime. You will continue to have Pro access until the end of your paid period, then automatically switch to Free with the 3 habits and 3 goals limit.'
    },
    {
      q: 'How do I track my habit streak?',
      a: 'Navigate to the Habits tab. Each habit card shows your current streak (consecutive days completed). The flame icon indicates your longest streak.'
    },
    {
      q: 'What are the Free plan limits?',
      a: 'Free users can create up to 3 habits and 3 goals. You also get basic analytics, limited templates, and basic statistics. Upgrade to Pro for unlimited access.'
    },
    {
      q: 'How do I export my data?',
      a: 'Pro users: Go to Profile > Export Data. Choose from PDF Report, Full Goals CSV, Tasks CSV, or Summary CSV. Free users need to upgrade to access export features.'
    },
    {
      q: 'Can I change my subscription plan?',
      a: 'Yes! Go to Profile > Subscription > Manage Billing to access your Stripe billing portal where you can change plans, update payment methods, or view invoices.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor.'
    },
  ];

  const gettingStartedSteps = [
    {
      title: 'Create Your First Habit',
      steps: [
        'Navigate to the Habits tab from the bottom navigation',
        'Tap the purple "+" button in the top right',
        'Choose a category (Health, Productivity, etc.)',
        'Enter habit name and description',
        'Set frequency (daily, weekly, custom)',
        'Choose difficulty level and color',
        'Save your habit',
        'Mark it complete each day to build your streak!'
      ]
    },
    {
      title: 'Set Your First Goal',
      steps: [
        'Go to the Goals tab',
        'Tap the floating action button (blue circle with "+")',
        'Enter goal title and description',
        'Choose an icon and color',
        'Set a deadline (optional)',
        'Add tasks to break down your goal',
        'Save and start working towards your objective!'
      ]
    },
    {
      title: 'Understanding the Interface',
      areas: [
        'Diary: Your daily overview of tasks and habits',
        'Goals: Manage all your objectives and tasks',
        'Habits: Track daily habits and streaks',
        'Statistics: View your progress and analytics',
        'Profile: Manage account and settings'
      ]
    }
  ];

  const features = [
    {
      title: 'Habits Management',
      items: [
        'Create unlimited habits (Pro) or up to 3 (Free)',
        'Track daily completion with streak counting',
        'Categorize by Health, Productivity, Wellness, etc.',
        'Set difficulty levels: Easy, Medium, Hard',
        'View weekly stats and completion rates',
        'Use habit templates for quick setup'
      ]
    },
    {
      title: 'Goals & Tasks',
      items: [
        'Create unlimited goals (Pro) or up to 3 (Free)',
        'Break goals into actionable tasks',
        'Set priorities: High, Medium, Low',
        'Add deadlines for time-bound objectives',
        'Track overall progress with visual indicators',
        'Use goal templates for common objectives'
      ]
    },
    {
      title: 'Analytics & Statistics',
      items: [
        'View completion trends over time',
        'Track weekly productivity patterns',
        'See task priority distribution',
        'Monitor goal category breakdown',
        'Advanced insights (Pro): streaks, detailed trends',
        'Export data for external analysis (Pro)'
      ]
    },
    {
      title: 'Templates',
      items: [
        'Free: Access first 3 habit templates',
        'Pro: All 10+ habit templates',
        'Free: 1 goal template',
        'Pro: All 10+ goal templates',
        'Categories: Fitness, Productivity, Learning, Wellness',
        'Pre-filled with best practices and recommendations'
      ]
    }
  ];

  const proFeatures = [
    { feature: 'Habits', free: '3 max', pro: 'Unlimited' },
    { feature: 'Goals', free: '3 max', pro: 'Unlimited' },
    { feature: 'Habit Templates', free: 'First 3', pro: 'All 10+' },
    { feature: 'Goal Templates', free: '1', pro: 'All 10+' },
    { feature: 'Analytics', free: 'Basic', pro: 'Advanced with insights' },
    { feature: 'Progress Photos', free: 'No', pro: 'Yes' },
    { feature: 'Export Data', free: 'No', pro: 'PDF & CSV' },
    { feature: 'Custom Themes', free: 'No', pro: 'Yes' },
    { feature: 'Priority Support', free: 'No', pro: 'Yes' },
  ];

  const tips = [
    {
      title: 'Building Consistent Habits',
      content: 'Start small with easy wins. Habit stacking (linking new habits to existing ones) increases success rates by 40%. Track daily without breaking the chain.'
    },
    {
      title: 'Setting SMART Goals',
      content: 'Make goals Specific, Measurable, Achievable, Relevant, and Time-bound. Break large goals into 5-10 smaller tasks for better progress tracking.'
    },
    {
      title: 'Reading Your Analytics',
      content: 'Weekly productivity patterns reveal your peak performance days. Use this data to schedule important tasks. Pro users get trend analysis for long-term planning.'
    },
    {
      title: 'Staying Motivated',
      content: 'Celebrate small wins. Track streaks visually. Share achievements with friends. Review your progress weekly to see how far you have come.'
    },
    {
      title: 'Using Templates Effectively',
      content: 'Templates provide proven frameworks. Customize them to fit your lifestyle. Pro users can access specialized templates for advanced goals.'
    }
  ];

  const troubleshooting = [
    {
      issue: 'App not loading properly',
      solutions: [
        'Clear browser cache and reload',
        'Try incognito/private browsing mode',
        'Check internet connection',
        'Update to latest browser version',
        'Contact support if issue persists'
      ]
    },
    {
      issue: 'Data not syncing',
      solutions: [
        'Ensure you are logged in',
        'Check network connectivity',
        'Refresh the page',
        'Log out and log back in',
        'Data syncs automatically in real-time'
      ]
    },
    {
      issue: 'Payment issues',
      solutions: [
        'Verify card details are correct',
        'Ensure sufficient funds available',
        'Try a different payment method',
        'Check if card supports international payments',
        'Contact your bank if declined',
        'Reach out to support for assistance'
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Goals Tracker
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your comprehensive platform for building habits and achieving goals. Let's get you started!
              </p>
            </div>

            {gettingStartedSteps.map((guide, index) => (
              <div key={index} className="p-6 rounded-2xl glass-light dark:glass-dark">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {guide.title}
                </h3>
                {guide.steps && (
                  <ol className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {guide.areas && (
                  <ul className="space-y-2">
                    {guide.areas.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <ChevronRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Feature Guide
            </h2>
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-2xl glass-light dark:glass-dark">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <ul className="space-y-2">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'free-vs-pro':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Free vs Pro Comparison
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                See what you get with each plan and unlock your full potential with Pro.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-900 dark:text-white font-semibold">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">
                      Free
                    </th>
                    <th className="text-center py-4 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-xl">
                      <div className="flex items-center justify-center gap-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-600 dark:text-purple-400 font-bold">Pro</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proFeatures.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                        {item.feature}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                        {item.free}
                      </td>
                      <td className="py-4 px-4 text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {item.pro}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <h3 className="text-xl font-bold mb-2">Upgrade to Pro Today</h3>
              <p className="mb-4 opacity-90">
                Unlock unlimited habits, goals, all templates, advanced analytics, and more for just $4.99/month.
              </p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
                View Pricing Plans
              </button>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            {faqItems.map((item, index) => (
              <div key={index} className="p-6 rounded-2xl glass-light dark:glass-dark">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Troubleshooting Guide
            </h2>
            {troubleshooting.map((item, index) => (
              <div key={index} className="p-6 rounded-2xl glass-light dark:glass-dark">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {item.issue}
                </h3>
                <ul className="space-y-2">
                  {item.solutions.map((solution, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <ChevronRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tips & Best Practices
            </h2>
            {tips.map((tip, index) => (
              <div key={index} className="p-6 rounded-2xl glass-light dark:glass-dark">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {tip.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tip.content}
                </p>
              </div>
            ))}
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Support
            </h2>
            
            <div className="p-6 rounded-2xl glass-light dark:glass-dark">
              <div className="flex items-start gap-4 mb-4">
                <Mail className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Email Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Get help via email within 24 hours (Pro users: within 4 hours)
                  </p>
                  <a href="mailto:support@goalstracker.app" className="text-blue-500 hover:text-blue-600">
                    support@goalstracker.app
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-light dark:glass-dark">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Support Hours
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                Saturday - Sunday: Limited support
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-light dark:glass-dark">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Report a Bug
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Found a bug? Help us improve by reporting it with details about what happened, steps to reproduce, and screenshots if possible.
              </p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm font-medium">
                Report Bug
              </button>
            </div>

            <div className="p-6 rounded-2xl glass-light dark:glass-dark">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Feature Requests
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Have an idea for a new feature? We would love to hear it! Send us your suggestions and help shape the future of Goals Tracker.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-screen px-4 pt-16 pb-20">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
            <p className="text-gray-300">Everything you need to know about Goals Tracker</p>
          </div>

          <div className="p-6 rounded-[32px] glass-light dark:glass-dark">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass-light dark:glass-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'glass-light dark:glass-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.title}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {renderContent()}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl glass-light dark:glass-dark text-gray-900 dark:text-white font-semibold hover:scale-[1.02] active:scale-95 transition-all"
              >
                Close Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
