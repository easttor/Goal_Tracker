import { supabase } from './supabase'
import type { ActivityFeedItem, ActivityType } from '../types'

/**
 * Activity Service
 * Handles activity feed, social activity tracking, and celebrations
 */

export class ActivityService {
  /**
   * Create activity entry
   */
  static async createActivity(
    activityType: ActivityType,
    metadata: any = {},
    goalId?: string,
    taskId?: string,
    teamGoalId?: string,
    isPublic: boolean = true
  ): Promise<ActivityFeedItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          goal_id: goalId,
          task_id: taskId,
          team_goal_id: teamGoalId,
          metadata,
          is_public: isPublic
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error creating activity:', error)
      return null
    }
  }

  /**
   * Get activity feed for current user (includes followed users' activity)
   */
  static async getActivityFeed(limit: number = 50): Promise<ActivityFeedItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get users current user is following
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = following?.map(f => f.following_id) || []

      // Get activity from followed users and current user
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles(*),
          goal:goals(*),
          task:tasks(*),
          team_goal:team_goals(*)
        `)
        .or(`user_id.eq.${user.id},user_id.in.(${followingIds.join(',')})`)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching activity feed:', error)
      return []
    }
  }

  /**
   * Get user's own activity
   */
  static async getUserActivity(userId: string, limit: number = 50): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles(*),
          goal:goals(*),
          task:tasks(*),
          team_goal:team_goals(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching user activity:', error)
      return []
    }
  }

  /**
   * Get public activity (discover feed)
   */
  static async getPublicActivity(limit: number = 50): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles(*),
          goal:goals(*),
          task:tasks(*),
          team_goal:team_goals(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching public activity:', error)
      return []
    }
  }

  /**
   * Delete activity entry
   */
  static async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('id', activityId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting activity:', error)
      return false
    }
  }

  /**
   * Update activity visibility
   */
  static async updateActivityVisibility(
    activityId: string,
    isPublic: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .update({ is_public: isPublic })
        .eq('id', activityId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating activity visibility:', error)
      return false
    }
  }

  /**
   * Get activity count by type for a user
   */
  static async getActivityCountByType(
    userId: string,
    activityType: ActivityType
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activity_type', activityType)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching activity count:', error)
      return 0
    }
  }

  /**
   * Get recent achievements for a user
   */
  static async getRecentAchievements(userId: string, limit: number = 10): Promise<ActivityFeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('user_id', userId)
        .eq('activity_type', 'achievement_unlocked')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching recent achievements:', error)
      return []
    }
  }

  // ==========================================
  // AUTOMATIC ACTIVITY TRACKING
  // ==========================================

  /**
   * Track goal completion
   */
  static async trackGoalCompletion(goalId: string, goalTitle: string) {
    return await this.createActivity(
      'goal_completed',
      { goal_title: goalTitle },
      goalId,
      undefined,
      undefined,
      true
    )
  }

  /**
   * Track task completion
   */
  static async trackTaskCompletion(taskId: string, taskText: string, goalId?: string) {
    return await this.createActivity(
      'task_completed',
      { task_text: taskText },
      goalId,
      taskId,
      undefined,
      true
    )
  }

  /**
   * Track milestone reached
   */
  static async trackMilestoneReached(
    goalId: string,
    milestoneTitle: string,
    milestoneValue: number
  ) {
    return await this.createActivity(
      'milestone_reached',
      { 
        milestone_title: milestoneTitle,
        milestone_value: milestoneValue
      },
      goalId,
      undefined,
      undefined,
      true
    )
  }

  /**
   * Track streak achievement
   */
  static async trackStreakAchievement(streakDays: number, habitTitle: string) {
    return await this.createActivity(
      'streak_achieved',
      { 
        streak_days: streakDays,
        habit_title: habitTitle
      },
      undefined,
      undefined,
      undefined,
      true
    )
  }

  /**
   * Track goal shared
   */
  static async trackGoalShared(goalId: string, goalTitle: string, sharedWithCount: number) {
    return await this.createActivity(
      'goal_shared',
      { 
        goal_title: goalTitle,
        shared_with_count: sharedWithCount
      },
      goalId,
      undefined,
      undefined,
      true
    )
  }

  /**
   * Track team joined
   */
  static async trackTeamJoined(teamGoalId: string, teamTitle: string) {
    return await this.createActivity(
      'team_joined',
      { team_title: teamTitle },
      undefined,
      undefined,
      teamGoalId,
      true
    )
  }

  /**
   * Track comment added
   */
  static async trackCommentAdded(
    commentContent: string,
    goalId?: string,
    taskId?: string,
    teamGoalId?: string
  ) {
    return await this.createActivity(
      'comment_added',
      { 
        comment_preview: commentContent.substring(0, 100)
      },
      goalId,
      taskId,
      teamGoalId,
      true
    )
  }

  /**
   * Track achievement unlocked
   */
  static async trackAchievementUnlocked(achievementTitle: string, achievementType: string) {
    return await this.createActivity(
      'achievement_unlocked',
      { 
        achievement_title: achievementTitle,
        achievement_type: achievementType
      },
      undefined,
      undefined,
      undefined,
      true
    )
  }

  // ==========================================
  // ACTIVITY FORMATTING
  // ==========================================

  /**
   * Get activity description for display
   */
  static getActivityDescription(activity: ActivityFeedItem): string {
    const username = activity.user?.display_name || activity.user?.username || 'User'

    switch (activity.activity_type) {
      case 'goal_completed':
        return `${username} completed goal: ${activity.metadata?.goal_title}`
      case 'task_completed':
        return `${username} completed a task: ${activity.metadata?.task_text}`
      case 'milestone_reached':
        return `${username} reached milestone: ${activity.metadata?.milestone_title}`
      case 'streak_achieved':
        return `${username} achieved a ${activity.metadata?.streak_days}-day streak in ${activity.metadata?.habit_title}`
      case 'goal_shared':
        return `${username} shared a goal: ${activity.metadata?.goal_title}`
      case 'team_joined':
        return `${username} joined team: ${activity.metadata?.team_title}`
      case 'comment_added':
        return `${username} added a comment`
      case 'achievement_unlocked':
        return `${username} unlocked achievement: ${activity.metadata?.achievement_title}`
      default:
        return `${username} had an activity`
    }
  }

  /**
   * Get activity icon
   */
  static getActivityIcon(activityType: ActivityType): string {
    switch (activityType) {
      case 'goal_completed':
        return '🎯'
      case 'task_completed':
        return '✓'
      case 'milestone_reached':
        return '🏆'
      case 'streak_achieved':
        return '🔥'
      case 'goal_shared':
        return '🤝'
      case 'team_joined':
        return '👥'
      case 'comment_added':
        return '💬'
      case 'achievement_unlocked':
        return '⭐'
      default:
        return '📌'
    }
  }

  /**
   * Subscribe to activity feed changes
   */
  static subscribeToActivityFeed(callback: () => void) {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to user activity changes
   */
  static subscribeToUserActivity(userId: string, callback: () => void) {
    const channel = supabase
      .channel(`activity:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${userId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
