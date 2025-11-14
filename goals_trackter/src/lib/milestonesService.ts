import { supabase } from './supabase'
import { Milestone } from '../types'

export class MilestonesService {
  private static tableName = 'milestones'

  // Get milestones for a goal
  static async getMilestones(goalId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('goal_id', goalId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching milestones:', error)
      throw error
    }
  }

  // Create a milestone
  static async createMilestone(
    userId: string,
    goalId: string,
    milestoneData: Partial<Milestone>
  ): Promise<Milestone> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: userId,
          goal_id: goalId,
          title: milestoneData.title,
          description: milestoneData.description,
          target_value: milestoneData.target_value,
          current_value: milestoneData.current_value || 0,
          unit: milestoneData.unit,
          is_achieved: false,
          order_index: milestoneData.order_index || 0
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating milestone:', error)
      throw error
    }
  }

  // Update a milestone
  static async updateMilestone(
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Milestone> {
    try {
      const updateData: any = { ...updates }
      
      // Check if milestone is achieved
      if (updates.current_value !== undefined && updates.target_value !== undefined) {
        if (updates.current_value >= updates.target_value) {
          updateData.is_achieved = true
          updateData.achieved_at = new Date().toISOString()
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating milestone:', error)
      throw error
    }
  }

  // Update milestone progress
  static async updateProgress(
    milestoneId: string,
    currentValue: number
  ): Promise<Milestone> {
    try {
      // Get current milestone to check target
      const { data: milestone, error: fetchError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', milestoneId)
        .single()

      if (fetchError) throw fetchError

      const updateData: any = { current_value: currentValue }
      
      // Check if achieved
      if (milestone.target_value && currentValue >= milestone.target_value) {
        updateData.is_achieved = true
        updateData.achieved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating milestone progress:', error)
      throw error
    }
  }

  // Delete a milestone
  static async deleteMilestone(milestoneId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', milestoneId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting milestone:', error)
      throw error
    }
  }

  // Get achieved milestones for a goal
  static async getAchievedMilestones(goalId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('goal_id', goalId)
        .eq('is_achieved', true)
        .order('achieved_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching achieved milestones:', error)
      throw error
    }
  }

  // Get milestone progress percentage
  static async getMilestoneProgress(milestoneId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('current_value, target_value')
        .eq('id', milestoneId)
        .single()

      if (error) throw error
      
      if (!data.target_value || data.target_value === 0) return 0
      
      const progress = (data.current_value / data.target_value) * 100
      return Math.min(100, Math.max(0, progress))
    } catch (error) {
      console.error('Error calculating milestone progress:', error)
      return 0
    }
  }

  // Subscribe to milestone changes for a goal
  static subscribeToMilestoneChanges(goalId: string, callback: (milestones: Milestone[]) => void) {
    const subscription = supabase
      .channel(`milestones-${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `goal_id=eq.${goalId}`
        },
        async () => {
          const milestones = await this.getMilestones(goalId)
          callback(milestones)
        }
      )
      .subscribe()

    return subscription
  }
}
