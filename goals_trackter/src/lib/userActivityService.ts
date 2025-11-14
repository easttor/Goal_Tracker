import { supabase } from './supabase'

export interface UserActivity {
  id: string
  user_id: string
  activity_date: string
  goals_completed_count: number
  tasks_completed_count: number
  habits_completed_count: number
  last_login_at: string
  created_at: string
  updated_at: string
}

export interface ActivityStats {
  totalGoalsCompleted: number
  totalTasksCompleted: number
  totalHabitsCompleted: number
  currentStreak: number
  bestStreak: number
  totalActiveDays: number
  recentActivity: UserActivity[]
}

export class UserActivityService {
  private static tableName = 'user_activity'

  // Get user activity stats
  static async getActivityStats(userId: string): Promise<ActivityStats> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })

      if (error) throw error

      const activities = data || []

      // Calculate totals
      const totalGoalsCompleted = activities.reduce((sum, a) => sum + a.goals_completed_count, 0)
      const totalTasksCompleted = activities.reduce((sum, a) => sum + a.tasks_completed_count, 0)
      const totalHabitsCompleted = activities.reduce((sum, a) => sum + a.habits_completed_count, 0)

      // Calculate streaks
      const { currentStreak, bestStreak } = this.calculateStreaks(activities)

      return {
        totalGoalsCompleted,
        totalTasksCompleted,
        totalHabitsCompleted,
        currentStreak,
        bestStreak,
        totalActiveDays: activities.length,
        recentActivity: activities.slice(0, 30) // Last 30 days
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error)
      return {
        totalGoalsCompleted: 0,
        totalTasksCompleted: 0,
        totalHabitsCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalActiveDays: 0,
        recentActivity: []
      }
    }
  }

  // Calculate streaks from activity data
  private static calculateStreaks(activities: UserActivity[]): { currentStreak: number; bestStreak: number } {
    if (activities.length === 0) {
      return { currentStreak: 0, bestStreak: 0 }
    }

    // Sort by date descending
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
    )

    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.activity_date)
      
      if (!lastDate) {
        // First activity
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        activityDate.setHours(0, 0, 0, 0)
        
        const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0 || diffDays === 1) {
          tempStreak = 1
          currentStreak = 1
        }
      } else {
        const diffDays = Math.floor((lastDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          // Consecutive day
          tempStreak++
          if (currentStreak > 0) {
            currentStreak++
          }
        } else if (diffDays > 1) {
          // Streak broken
          if (currentStreak > 0 && tempStreak > currentStreak) {
            currentStreak = 0
          }
          bestStreak = Math.max(bestStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      lastDate = activityDate
    }

    bestStreak = Math.max(bestStreak, tempStreak, currentStreak)

    return { currentStreak, bestStreak }
  }

  // Track activity (called when user completes goals/tasks/habits)
  static async incrementCounter(userId: string, counterType: 'goals' | 'tasks' | 'habits', increment: number = 1): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_activity_counter', {
        p_user_id: userId,
        p_counter_type: counterType,
        p_increment: increment
      })

      if (error) throw error
    } catch (error) {
      console.error(`Error incrementing ${counterType} counter:`, error)
    }
  }

  // Get activity for specific date range
  static async getActivityRange(userId: string, startDate: string, endDate: string): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching activity range:', error)
      return []
    }
  }

  // Get recent activity summary
  static async getRecentSummary(userId: string, days: number = 7): Promise<{
    totalGoals: number
    totalTasks: number
    totalHabits: number
    daysActive: number
  }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const activities = await this.getActivityRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      return {
        totalGoals: activities.reduce((sum, a) => sum + a.goals_completed_count, 0),
        totalTasks: activities.reduce((sum, a) => sum + a.tasks_completed_count, 0),
        totalHabits: activities.reduce((sum, a) => sum + a.habits_completed_count, 0),
        daysActive: activities.length
      }
    } catch (error) {
      console.error('Error fetching recent summary:', error)
      return { totalGoals: 0, totalTasks: 0, totalHabits: 0, daysActive: 0 }
    }
  }
}
