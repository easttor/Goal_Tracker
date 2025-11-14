import { supabase } from './supabase'
import type { UserProfile, UserFollow, SocialStatistics } from '../types'

/**
 * Social Service
 * Handles user profiles, following, and social interactions
 */

export class SocialService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  /**
   * Get current user's profile
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      return await this.getUserProfile(user.id)
    } catch (error) {
      console.error('Error fetching current user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  /**
   * Search users by username or display name
   */
  static async searchUsers(query: string, limit = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .eq('is_public', true)
        .limit(limit)

      if (error) throw error
      return (data as UserProfile[]) || []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Follow a user
   */
  static async followUser(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error following user:', error)
      return false
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unfollowing user:', error)
      return false
    }
  }

  /**
   * Check if current user follows another user
   */
  static async isFollowing(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower_id, user_profiles!user_follows_follower_id_fkey(*)')
        .eq('following_id', userId)

      if (error) throw error
      return (data?.map((item: any) => item.user_profiles).filter(Boolean) as UserProfile[]) || []
    } catch (error) {
      console.error('Error fetching followers:', error)
      return []
    }
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id, user_profiles!user_follows_following_id_fkey(*)')
        .eq('follower_id', userId)

      if (error) throw error
      return (data?.map((item: any) => item.user_profiles).filter(Boolean) as UserProfile[]) || []
    } catch (error) {
      console.error('Error fetching following:', error)
      return []
    }
  }

  /**
   * Get follower count
   */
  static async getFollowerCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching follower count:', error)
      return 0
    }
  }

  /**
   * Get following count
   */
  static async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching following count:', error)
      return 0
    }
  }

  /**
   * Get social statistics for a user
   */
  static async getSocialStatistics(userId: string): Promise<SocialStatistics> {
    try {
      const [followers, following, sharedGoals, teamGoals, comments, publicGoals] = await Promise.all([
        this.getFollowerCount(userId),
        this.getFollowingCount(userId),
        supabase.from('goal_shares').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
        supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('visibility', 'public')
      ])

      return {
        followers,
        following,
        shared_goals: sharedGoals.count || 0,
        team_goals: teamGoals.count || 0,
        total_comments: comments.count || 0,
        public_goals: publicGoals.count || 0
      }
    } catch (error) {
      console.error('Error fetching social statistics:', error)
      return {
        followers: 0,
        following: 0,
        shared_goals: 0,
        team_goals: 0,
        total_comments: 0,
        public_goals: 0
      }
    }
  }

  /**
   * Subscribe to user profile changes
   */
  static subscribeToProfile(userId: string, callback: (profile: UserProfile) => void) {
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as UserProfile)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to follow changes for a user
   */
  static subscribeToFollows(userId: string, callback: () => void) {
    const channel = supabase
      .channel(`follows:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_follows',
          filter: `follower_id=eq.${userId}`
        },
        () => callback()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_follows',
          filter: `following_id=eq.${userId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
