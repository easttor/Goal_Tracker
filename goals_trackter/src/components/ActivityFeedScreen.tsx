import React, { useState, useEffect } from 'react'
import { Activity, Users, Globe, TrendingUp } from 'lucide-react'
import { ActivityService } from '../lib/activityService'
import type { ActivityFeedItem } from '../types'

export function ActivityFeedScreen() {
  const [activeTab, setActiveTab] = useState<'following' | 'discover'>('following')
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()

    // Subscribe to real-time activity updates
    const unsubscribe = ActivityService.subscribeToActivityFeed(loadActivities)
    return () => unsubscribe()
  }, [activeTab])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const data = activeTab === 'following' 
        ? await ActivityService.getActivityFeed()
        : await ActivityService.getPublicActivity()
      setActivities(data)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date?: string) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'goal_completed': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'task_completed': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'milestone_reached': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
      case 'streak_achieved': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
      case 'goal_shared': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      case 'team_joined': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
      case 'comment_added': return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
      case 'achievement_unlocked': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 pb-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Activity Feed
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            See what your network is achieving
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'following'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Following</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Discover</span>
            </button>
          </div>

          {/* Activity List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-2">No activity yet</p>
                {activeTab === 'following' ? (
                  <p className="text-sm">
                    Follow other users to see their achievements here
                  </p>
                ) : (
                  <p className="text-sm">
                    Be the first to share your progress publicly!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {getInitials(activity.user?.display_name || activity.user?.username)}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium mb-1">
                            <span className="font-semibold">
                              {activity.user?.display_name || activity.user?.username}
                            </span>
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {ActivityService.getActivityDescription(activity)}
                          </p>

                          {/* Activity Type Badge */}
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.activity_type)}`}>
                              <span className="mr-1">{ActivityService.getActivityIcon(activity.activity_type)}</span>
                              {activity.activity_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {activity.metadata && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {activity.metadata.goal_title && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Goal:</span>
                              <span>{activity.metadata.goal_title}</span>
                            </div>
                          )}
                          {activity.metadata.streak_days && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Streak:</span>
                              <span>{activity.metadata.streak_days} days</span>
                            </div>
                          )}
                          {activity.metadata.milestone_value && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Progress:</span>
                              <span>{activity.metadata.milestone_value}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
