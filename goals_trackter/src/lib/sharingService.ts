import { supabase } from './supabase'
import type { GoalShare, TeamGoal, TeamMember, PermissionLevel, TeamRole } from '../types'

/**
 * Sharing Service
 * Handles goal sharing, permissions, and team goal management
 */

export class SharingService {
  /**
   * Share a goal with a user
   */
  static async shareGoal(
    goalId: string,
    sharedWithUserId: string,
    permissionLevel: PermissionLevel = 'viewer'
  ): Promise<GoalShare | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('goal_shares')
        .insert({
          goal_id: goalId,
          owner_id: user.id,
          shared_with_user_id: sharedWithUserId,
          permission_level: permissionLevel
        })
        .select()
        .single()

      if (error) throw error
      return data as GoalShare
    } catch (error) {
      console.error('Error sharing goal:', error)
      return null
    }
  }

  /**
   * Update share permission
   */
  static async updateSharePermission(
    shareId: string,
    permissionLevel: PermissionLevel
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goal_shares')
        .update({
          permission_level: permissionLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating share permission:', error)
      return false
    }
  }

  /**
   * Remove goal share
   */
  static async removeShare(shareId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goal_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing share:', error)
      return false
    }
  }

  /**
   * Get shares for a goal
   */
  static async getGoalShares(goalId: string): Promise<GoalShare[]> {
    try {
      const { data, error } = await supabase
        .from('goal_shares')
        .select(`
          *,
          shared_with_user:user_profiles!goal_shares_shared_with_user_id_fkey(*)
        `)
        .eq('goal_id', goalId)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching goal shares:', error)
      return []
    }
  }

  /**
   * Get goals shared with current user
   */
  static async getSharedWithMe(): Promise<GoalShare[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('goal_shares')
        .select(`
          *,
          goal:goals(*)
        `)
        .eq('shared_with_user_id', user.id)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching shared goals:', error)
      return []
    }
  }

  /**
   * Check user permission for a goal
   */
  static async getUserPermission(goalId: string): Promise<PermissionLevel | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('goal_shares')
        .select('permission_level')
        .eq('goal_id', goalId)
        .eq('shared_with_user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.permission_level as PermissionLevel || null
    } catch (error) {
      console.error('Error checking permission:', error)
      return null
    }
  }

  // ==========================================
  // TEAM GOALS
  // ==========================================

  /**
   * Create a team goal
   */
  static async createTeamGoal(teamGoal: Partial<TeamGoal>): Promise<TeamGoal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('team_goals')
        .insert({
          ...teamGoal,
          creator_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as owner in team_members
      if (data) {
        await supabase.from('team_members').insert({
          team_goal_id: data.id,
          user_id: user.id,
          role: 'owner'
        })
      }

      return data as TeamGoal
    } catch (error) {
      console.error('Error creating team goal:', error)
      return null
    }
  }

  /**
   * Update team goal
   */
  static async updateTeamGoal(
    teamGoalId: string,
    updates: Partial<TeamGoal>
  ): Promise<TeamGoal | null> {
    try {
      const { data, error } = await supabase
        .from('team_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamGoalId)
        .select()
        .single()

      if (error) throw error
      return data as TeamGoal
    } catch (error) {
      console.error('Error updating team goal:', error)
      return null
    }
  }

  /**
   * Delete team goal
   */
  static async deleteTeamGoal(teamGoalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_goals')
        .delete()
        .eq('id', teamGoalId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting team goal:', error)
      return false
    }
  }

  /**
   * Get team goals for current user
   */
  static async getMyTeamGoals(): Promise<TeamGoal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get team goal IDs where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_goal_id')
        .eq('user_id', user.id)

      if (memberError) throw memberError

      const teamGoalIds = memberData?.map(m => m.team_goal_id) || []
      if (teamGoalIds.length === 0) return []

      const { data, error } = await supabase
        .from('team_goals')
        .select(`
          *,
          creator:user_profiles!team_goals_creator_id_fkey(*)
        `)
        .in('id', teamGoalIds)
        .eq('is_active', true)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching team goals:', error)
      return []
    }
  }

  /**
   * Get team goal by ID with members
   */
  static async getTeamGoal(teamGoalId: string): Promise<TeamGoal | null> {
    try {
      const { data, error } = await supabase
        .from('team_goals')
        .select(`
          *,
          creator:user_profiles!team_goals_creator_id_fkey(*),
          members:team_members(
            *,
            user:user_profiles(*)
          )
        `)
        .eq('id', teamGoalId)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error fetching team goal:', error)
      return null
    }
  }

  /**
   * Add member to team goal
   */
  static async addTeamMember(
    teamGoalId: string,
    userId: string,
    role: TeamRole = 'collaborator'
  ): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_goal_id: teamGoalId,
          user_id: userId,
          role
        })
        .select()
        .single()

      if (error) throw error
      return data as TeamMember
    } catch (error) {
      console.error('Error adding team member:', error)
      return null
    }
  }

  /**
   * Update team member role
   */
  static async updateTeamMemberRole(
    memberId: string,
    role: TeamRole
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating team member role:', error)
      return false
    }
  }

  /**
   * Remove team member
   */
  static async removeTeamMember(memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing team member:', error)
      return false
    }
  }

  /**
   * Get team members
   */
  static async getTeamMembers(teamGoalId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('team_goal_id', teamGoalId)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching team members:', error)
      return []
    }
  }

  /**
   * Get user's role in team
   */
  static async getUserTeamRole(teamGoalId: string): Promise<TeamRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_goal_id', teamGoalId)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.role as TeamRole || null
    } catch (error) {
      console.error('Error checking team role:', error)
      return null
    }
  }

  /**
   * Update team goal progress
   */
  static async updateTeamProgress(
    teamGoalId: string,
    incrementBy: number
  ): Promise<boolean> {
    try {
      // Get current value
      const { data: teamGoal, error: fetchError } = await supabase
        .from('team_goals')
        .select('current_value, target_value')
        .eq('id', teamGoalId)
        .single()

      if (fetchError) throw fetchError

      const newValue = (teamGoal.current_value || 0) + incrementBy
      const cappedValue = teamGoal.target_value 
        ? Math.min(newValue, teamGoal.target_value)
        : newValue

      const { error } = await supabase
        .from('team_goals')
        .update({
          current_value: cappedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamGoalId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating team progress:', error)
      return false
    }
  }

  /**
   * Subscribe to goal shares changes
   */
  static subscribeToGoalShares(goalId: string, callback: () => void) {
    const channel = supabase
      .channel(`goal-shares:${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal_shares',
          filter: `goal_id=eq.${goalId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to team goal changes
   */
  static subscribeToTeamGoal(teamGoalId: string, callback: () => void) {
    const channel = supabase
      .channel(`team-goal:${teamGoalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_goals',
          filter: `id=eq.${teamGoalId}`
        },
        () => callback()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `team_goal_id=eq.${teamGoalId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
