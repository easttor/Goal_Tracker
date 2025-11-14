import { supabase } from './supabase'
import { Habit, HabitCompletion, HabitTemplate, HabitAchievement, HabitNote, HabitProgressPhoto, HabitCategory } from '../types'

export class HabitsService {
  private static tableName = 'habits'
  private static completionsTable = 'habit_completions'
  private static templatesTable = 'habit_templates'
  private static achievementsTable = 'habit_achievements'
  private static notesTable = 'habit_notes'
  private static photosTable = 'habit_progress_photos'

  // Get all habits for user
  static async getHabits(userId: string): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habits:', error)
      throw error
    }
  }

  // Get habits for a specific goal
  static async getHabitsByGoal(goalId: string): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habits by goal:', error)
      throw error
    }
  }

  // Create a new habit
  static async createHabit(userId: string, habitData: Partial<Habit>): Promise<Habit> {
    try {
      const { data, error} = await supabase
        .from(this.tableName)
        .insert([{
          user_id: userId,
          goal_id: habitData.goal_id,
          title: habitData.title,
          description: habitData.description,
          frequency: habitData.frequency || 'daily',
          target_count: habitData.target_count || 1,
          current_streak: 0,
          best_streak: 0
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating habit:', error)
      throw error
    }
  }

  // Update a habit
  static async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', habitId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating habit:', error)
      throw error
    }
  }

  // Delete a habit
  static async deleteHabit(habitId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', habitId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting habit:', error)
      throw error
    }
  }

  // Complete a habit for a date
  static async completeHabit(userId: string, habitId: string, date?: string): Promise<HabitCompletion> {
    const completionDate = date || new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from(this.completionsTable)
        .insert([{
          user_id: userId,
          habit_id: habitId,
          completion_date: completionDate
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error completing habit:', error)
      throw error
    }
  }

  // Uncomplete a habit for a date
  static async uncompleteHabit(habitId: string, date?: string): Promise<void> {
    const completionDate = date || new Date().toISOString().split('T')[0]
    
    try {
      const { error } = await supabase
        .from(this.completionsTable)
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', completionDate)

      if (error) throw error
    } catch (error) {
      console.error('Error uncompleting habit:', error)
      throw error
    }
  }

  // Get completions for a habit
  static async getHabitCompletions(habitId: string, limit: number = 30): Promise<HabitCompletion[]> {
    try {
      const { data, error } = await supabase
        .from(this.completionsTable)
        .select('*')
        .eq('habit_id', habitId)
        .order('completion_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habit completions:', error)
      throw error
    }
  }

  // Check if habit is completed for a specific date
  static async isHabitCompleted(habitId: string, date?: string): Promise<boolean> {
    const completionDate = date || new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from(this.completionsTable)
        .select('id')
        .eq('habit_id', habitId)
        .eq('completion_date', completionDate)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data !== null
    } catch (error) {
      console.error('Error checking habit completion:', error)
      return false
    }
  }

  // Get habit statistics
  static async getHabitStats(habitId: string): Promise<{
    totalCompletions: number
    currentStreak: number
    bestStreak: number
    completionRate: number
  }> {
    try {
      // Get habit details
      const { data: habit, error: habitError } = await supabase
        .from(this.tableName)
        .select('current_streak, best_streak, created_at')
        .eq('id', habitId)
        .single()

      if (habitError) throw habitError

      // Get total completions
      const { count, error: countError } = await supabase
        .from(this.completionsTable)
        .select('*', { count: 'exact', head: true })
        .eq('habit_id', habitId)

      if (countError) throw countError

      // Calculate days since creation
      const createdDate = new Date(habit.created_at)
      const today = new Date()
      const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate completion rate
      const completionRate = daysSinceCreation > 0 ? ((count || 0) / daysSinceCreation) * 100 : 0

      return {
        totalCompletions: count || 0,
        currentStreak: habit.current_streak,
        bestStreak: habit.best_streak,
        completionRate: Math.min(100, completionRate)
      }
    } catch (error) {
      console.error('Error fetching habit stats:', error)
      throw error
    }
  }

  // Subscribe to habit changes
  static subscribeToHabitChanges(userId: string, callback: (habits: Habit[]) => void) {
    const subscription = supabase
      .channel(`habits-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Trigger refetch in a non-blocking way
          this.getHabits(userId).then(habits => {
            callback(habits)
          }).catch(error => {
            console.error('Error refetching habits after real-time update:', error)
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to habits changes')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to habits channel')
        }
      })

    return subscription
  }

  // ============================================
  // HABIT TEMPLATES
  // ============================================

  // Get all public habit templates
  static async getHabitTemplates(category?: HabitCategory): Promise<HabitTemplate[]> {
    try {
      let query = supabase
        .from(this.templatesTable)
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habit templates:', error)
      throw error
    }
  }

  // Create habit from template
  static async createHabitFromTemplate(userId: string, templateId: string, customData?: Partial<Habit>): Promise<Habit> {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from(this.templatesTable)
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Create habit from template
      const habitData = {
        user_id: userId,
        title: customData?.title || template.name,
        description: customData?.description || template.description,
        category: customData?.category || template.category,
        color: customData?.color || template.color,
        icon: customData?.icon || template.icon,
        frequency: customData?.frequency || template.frequency,
        difficulty_level: customData?.difficulty_level || template.difficulty_level,
        target_count: customData?.target_count || template.target_count,
        reminder_enabled: customData?.reminder_enabled || false,
        notes_enabled: true,
        photos_enabled: customData?.photos_enabled || false,
        current_streak: 0,
        best_streak: 0,
        is_paused: false
      }

      const { data: habit, error: habitError } = await supabase
        .from(this.tableName)
        .insert([habitData])
        .select()
        .single()

      if (habitError) throw habitError

      // Increment template usage count
      await supabase
        .from(this.templatesTable)
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId)

      return habit
    } catch (error) {
      console.error('Error creating habit from template:', error)
      throw error
    }
  }

  // ============================================
  // HABIT ACHIEVEMENTS
  // ============================================

  // Get achievements for a habit
  static async getHabitAchievements(habitId: string): Promise<HabitAchievement[]> {
    try {
      const { data, error } = await supabase
        .from(this.achievementsTable)
        .select('*')
        .eq('habit_id', habitId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habit achievements:', error)
      throw error
    }
  }

  // Get all achievements for a user
  static async getUserAchievements(userId: string): Promise<HabitAchievement[]> {
    try {
      const { data, error } = await supabase
        .from(this.achievementsTable)
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      throw error
    }
  }

  // ============================================
  // HABIT NOTES
  // ============================================

  // Add or update note for a habit completion
  static async saveHabitNote(userId: string, habitId: string, completionDate: string, note: string, mood?: string): Promise<HabitNote> {
    try {
      const { data, error } = await supabase
        .from(this.notesTable)
        .upsert({
          habit_id: habitId,
          user_id: userId,
          completion_date: completionDate,
          note,
          mood
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving habit note:', error)
      throw error
    }
  }

  // Get notes for a habit
  static async getHabitNotes(habitId: string, limit: number = 30): Promise<HabitNote[]> {
    try {
      const { data, error } = await supabase
        .from(this.notesTable)
        .select('*')
        .eq('habit_id', habitId)
        .order('completion_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habit notes:', error)
      throw error
    }
  }

  // Get note for specific date
  static async getHabitNoteForDate(habitId: string, date: string): Promise<HabitNote | null> {
    try {
      const { data, error } = await supabase
        .from(this.notesTable)
        .select('*')
        .eq('habit_id', habitId)
        .eq('completion_date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching habit note:', error)
      return null
    }
  }

  // ============================================
  // HABIT PROGRESS PHOTOS
  // ============================================

  // Add progress photo
  static async addProgressPhoto(userId: string, habitId: string, photoUrl: string, caption?: string): Promise<HabitProgressPhoto> {
    try {
      const { data, error } = await supabase
        .from(this.photosTable)
        .insert({
          user_id: userId,
          habit_id: habitId,
          photo_url: photoUrl,
          caption
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding progress photo:', error)
      throw error
    }
  }

  // Get progress photos for a habit
  static async getProgressPhotos(habitId: string): Promise<HabitProgressPhoto[]> {
    try {
      const { data, error } = await supabase
        .from(this.photosTable)
        .select('*')
        .eq('habit_id', habitId)
        .order('taken_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching progress photos:', error)
      throw error
    }
  }

  // Delete progress photo
  static async deleteProgressPhoto(photoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.photosTable)
        .delete()
        .eq('id', photoId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting progress photo:', error)
      throw error
    }
  }

  // ============================================
  // FILTERING AND SEARCH
  // ============================================

  // Get habits by category
  static async getHabitsByCategory(userId: string, category: HabitCategory): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habits by category:', error)
      throw error
    }
  }

  // Search habits
  static async searchHabits(userId: string, searchTerm: string): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching habits:', error)
      throw error
    }
  }

  // Get habits with filters
  static async getFilteredHabits(
    userId: string,
    filters: {
      category?: HabitCategory
      color?: string
      difficulty?: string
      isPaused?: boolean
    }
  ): Promise<Habit[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.color) {
        query = query.eq('color', filters.color)
      }
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty)
      }
      if (filters.isPaused !== undefined) {
        query = query.eq('is_paused', filters.isPaused)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching filtered habits:', error)
      throw error
    }
  }

  // ============================================
  // PAUSE/RESUME HABITS
  // ============================================

  // Pause habit
  static async pauseHabit(habitId: string, reason?: string): Promise<Habit> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_paused: true,
          pause_reason: reason,
          paused_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error pausing habit:', error)
      throw error
    }
  }

  // Resume habit
  static async resumeHabit(habitId: string): Promise<Habit> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_paused: false,
          pause_reason: null,
          paused_at: null
        })
        .eq('id', habitId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error resuming habit:', error)
      throw error
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  // Get habit completion history for calendar view
  static async getHabitCompletionHistory(habitId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
    try {
      const { data, error } = await supabase
        .from(this.completionsTable)
        .select('*')
        .eq('habit_id', habitId)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate)
        .order('completion_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching habit completion history:', error)
      throw error
    }
  }

  // Get weekly completion stats
  static async getWeeklyStats(userId: string): Promise<{
    totalHabits: number
    completedToday: number
    weekCompletion: number
    topStreak: number
  }> {
    try {
      // Get all habits
      const habits = await this.getHabits(userId)
      const today = new Date().toISOString().split('T')[0]
      
      // Get completions for today
      let completedToday = 0
      for (const habit of habits) {
        const isCompleted = await this.isHabitCompleted(habit.id, today)
        if (isCompleted) completedToday++
      }

      // Calculate top streak
      const topStreak = Math.max(...habits.map(h => h.current_streak), 0)

      // Get week completions (last 7 days)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 6)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const { count, error } = await supabase
        .from(this.completionsTable)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completion_date', weekStartStr)

      if (error) throw error

      return {
        totalHabits: habits.length,
        completedToday,
        weekCompletion: count || 0,
        topStreak
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      throw error
    }
  }
}
