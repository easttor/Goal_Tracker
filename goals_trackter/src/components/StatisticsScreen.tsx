import React, { useState, useEffect } from 'react'
import { ArrowLeft, MoreHorizontal, TrendingUp, Lock, Crown, Sparkles } from 'lucide-react'
import { Goal } from '../types'
import { calculateProgress } from '../lib/utils'
import AchievementSystem from './AchievementSystem'
import EnhancedCharts from './EnhancedCharts'
import { UserActivityService, ActivityStats } from '../lib/userActivityService'
import { useAuth } from '../lib/auth'
import { subscriptionService } from '../lib/subscriptionService'
import ProBadge from './ProBadge'
import ProUpgradeBanner from './ProUpgradeBanner'

interface StatisticsScreenProps {
  goals: Goal[]
  onNavigate?: (page: string) => void
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ goals, onNavigate }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')
  const [isPro, setIsPro] = useState(false)
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalGoalsCompleted: 0,
    totalTasksCompleted: 0,
    totalHabitsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalActiveDays: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadActivityStats()
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return
    try {
      const subscription = await subscriptionService.getUserSubscription(user.id)
      setIsPro(subscription?.status === 'active' && subscription?.plan?.name === 'Pro')
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const loadActivityStats = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const stats = await UserActivityService.getActivityStats(user.id)
      setActivityStats(stats)
    } catch (error) {
      console.error('Error loading activity stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate overall statistics
  const totalGoals = goals.length
  const totalTasks = goals.reduce((sum, goal) => sum + goal.tasks.length, 0)
  const completedTasks = goals.reduce((sum, goal) => 
    sum + goal.tasks.filter(task => task.isComplete).length, 0)
  const completedGoals = goals.filter(goal => {
    const goalProgress = calculateProgress(
      goal.tasks.filter(t => t.isComplete).length,
      goal.tasks.length
    )
    return goalProgress === 100
  }).length

  const goalsProgress = calculateProgress(completedGoals, totalGoals)
  const tasksProgress = calculateProgress(completedTasks, totalTasks)

  // Generate mock weekly data for the chart
  const weeklyData = [75, 85, 30, 80, 60, 100, 10]
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div id="statisticsScreen" className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/statistics_background_3.jpg)',
          filter: 'brightness(0.3)'
        }}
      />
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm -z-10" />
      
      <header className="p-4 pt-6 flex justify-between items-center relative">
        <button className="text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2 dark:text-gray-100">Progress Report</h1>
        <button className="text-gray-700 dark:text-gray-300">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <div className="p-4 flex justify-center space-x-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`stat-tab px-5 py-2 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'overview' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`stat-tab px-5 py-2 rounded-full font-medium text-sm transition-colors flex items-center gap-2 ${
            activeTab === 'analytics' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Achievement System */}
      <div className="px-4 mb-4 flex justify-center">
        {!loading && (
          <AchievementSystem
            completedGoals={activityStats.totalGoalsCompleted}
            completedTasks={activityStats.totalTasksCompleted}
            currentStreak={activityStats.currentStreak}
            bestStreak={activityStats.bestStreak}
            totalDays={activityStats.totalActiveDays}
          />
        )}
      </div>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'overview' ? (
        <div id="statsContent" className="p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Goals Achieved</h3>
            <div 
              className="progress-circle mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(from 0deg, #3b82f6 ${goalsProgress * 3.6}deg, ${
                  document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                } ${goalsProgress * 3.6}deg)`
              }}
            >
              <div className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{goalsProgress}%</span>
              </div>
            </div>
            <p className="text-green-500 dark:text-green-400 font-medium mt-2">
              {completedGoals}/{totalGoals} goals
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
            <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Tasks Completed</h3>
            <div 
              className="progress-circle mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(from 0deg, #f97316 ${tasksProgress * 3.6}deg, ${
                  document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                } ${tasksProgress * 3.6}deg)`
              }}
            >
              <div className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 font-bold">{tasksProgress}%</span>
              </div>
            </div>
            <p className="text-green-500 dark:text-green-400 font-medium mt-2">
              {completedTasks}/{totalTasks} tasks
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 mt-4">
          <h3 className="font-semibold text-gray-600 dark:text-gray-300">Daily Activity</h3>
          <div className="flex items-center mb-2">
            <span className="text-3xl font-bold mr-2 dark:text-gray-100">{completedTasks}/{totalTasks} Tasks</span>
            <span className="text-green-500 dark:text-green-400 font-semibold">+{tasksProgress}%</span>
          </div>
          <div className="flex justify-between items-end h-40" id="barChart">
            {weeklyData.map((height, i) => (
              <div 
                key={i} 
                className="w-10 bg-blue-500 dark:bg-blue-600 rounded-lg transition-all duration-300" 
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            {weekDays.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
        </div>

        {/* Goals breakdown */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 mt-4">
          <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-3">Goals Breakdown</h3>
          <div className="space-y-3">
            {goals.map(goal => {
              const goalProgress = calculateProgress(
                goal.tasks.filter(t => t.isComplete).length,
                goal.tasks.length
              )
              return (
                <div key={goal.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`bg-${goal.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${goalProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                    {goalProgress}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      ) : (
        <div className="p-4">
          {/* Pro Upgrade Banner for Free Users */}
          {!loading && !isPro && (
            <div className="mb-4">
              <ProUpgradeBanner 
                onUpgrade={() => onNavigate?.('subscription')}
                message="Unlock detailed charts, trends, and advanced insights"
              />
            </div>
          )}

          {!loading ? (
            <div className="relative">
              {!isPro && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <Lock className="w-10 h-10 text-gray-400" />
                      <ProBadge variant="lock" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Advanced Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unlock with Pro membership
                    </p>
                  </div>
                </div>
              )}
              <EnhancedCharts goals={goals} recentActivity={activityStats.recentActivity} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StatisticsScreen