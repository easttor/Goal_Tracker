import { supabase } from './supabase'
import type { CommentEnhanced, CommentReaction, ReactionType } from '../types'

/**
 * Comments Service
 * Handles comments, replies, mentions, and reactions
 */

export class CommentsService {
  /**
   * Create a comment on a goal
   */
  static async createGoalComment(
    goalId: string,
    content: string,
    mentions: string[] = [],
    parentCommentId?: string
  ): Promise<CommentEnhanced | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          content,
          mentions,
          parent_comment_id: parentCommentId
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error creating goal comment:', error)
      return null
    }
  }

  /**
   * Create a comment on a task
   */
  static async createTaskComment(
    taskId: string,
    content: string,
    mentions: string[] = [],
    parentCommentId?: string
  ): Promise<CommentEnhanced | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          task_id: taskId,
          content,
          mentions,
          parent_comment_id: parentCommentId
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error creating task comment:', error)
      return null
    }
  }

  /**
   * Create a comment on a team goal
   */
  static async createTeamGoalComment(
    teamGoalId: string,
    content: string,
    mentions: string[] = [],
    parentCommentId?: string
  ): Promise<CommentEnhanced | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          team_goal_id: teamGoalId,
          content,
          mentions,
          parent_comment_id: parentCommentId
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error creating team goal comment:', error)
      return null
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    content: string,
    mentions: string[] = []
  ): Promise<CommentEnhanced | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          mentions,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error updating comment:', error)
      return null
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  /**
   * Get comments for a goal
   */
  static async getGoalComments(goalId: string): Promise<CommentEnhanced[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles(*),
          reactions:comment_reactions(
            *,
            user:user_profiles(*)
          )
        `)
        .eq('goal_id', goalId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await this.getCommentReplies(comment.id)
          return {
            ...comment,
            replies,
            reaction_count: comment.reactions?.length || 0
          }
        })
      )

      return commentsWithReplies as any[]
    } catch (error) {
      console.error('Error fetching goal comments:', error)
      return []
    }
  }

  /**
   * Get comments for a task
   */
  static async getTaskComments(taskId: string): Promise<CommentEnhanced[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles(*),
          reactions:comment_reactions(
            *,
            user:user_profiles(*)
          )
        `)
        .eq('task_id', taskId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await this.getCommentReplies(comment.id)
          return {
            ...comment,
            replies,
            reaction_count: comment.reactions?.length || 0
          }
        })
      )

      return commentsWithReplies as any[]
    } catch (error) {
      console.error('Error fetching task comments:', error)
      return []
    }
  }

  /**
   * Get comments for a team goal
   */
  static async getTeamGoalComments(teamGoalId: string): Promise<CommentEnhanced[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles(*),
          reactions:comment_reactions(
            *,
            user:user_profiles(*)
          )
        `)
        .eq('team_goal_id', teamGoalId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await this.getCommentReplies(comment.id)
          return {
            ...comment,
            replies,
            reaction_count: comment.reactions?.length || 0
          }
        })
      )

      return commentsWithReplies as any[]
    } catch (error) {
      console.error('Error fetching team goal comments:', error)
      return []
    }
  }

  /**
   * Get replies for a comment
   */
  static async getCommentReplies(parentCommentId: string): Promise<CommentEnhanced[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles(*),
          reactions:comment_reactions(
            *,
            user:user_profiles(*)
          )
        `)
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data || []).map(comment => ({
        ...comment,
        reaction_count: comment.reactions?.length || 0
      })) as any[]
    } catch (error) {
      console.error('Error fetching comment replies:', error)
      return []
    }
  }

  /**
   * Get comment count for a goal
   */
  static async getGoalCommentCount(goalId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('goal_id', goalId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching goal comment count:', error)
      return 0
    }
  }

  /**
   * Get comment count for a task
   */
  static async getTaskCommentCount(taskId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching task comment count:', error)
      return 0
    }
  }

  // ==========================================
  // REACTIONS
  // ==========================================

  /**
   * Add a reaction to a comment
   */
  static async addReaction(
    commentId: string,
    reactionType: ReactionType
  ): Promise<CommentReaction | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error
      return data as any
    } catch (error) {
      console.error('Error adding reaction:', error)
      return null
    }
  }

  /**
   * Remove a reaction from a comment
   */
  static async removeReaction(
    commentId: string,
    reactionType: ReactionType
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing reaction:', error)
      return false
    }
  }

  /**
   * Get reactions for a comment
   */
  static async getCommentReactions(commentId: string): Promise<CommentReaction[]> {
    try {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('comment_id', commentId)

      if (error) throw error
      return (data as any[]) || []
    } catch (error) {
      console.error('Error fetching comment reactions:', error)
      return []
    }
  }

  /**
   * Check if user reacted to a comment
   */
  static async hasUserReacted(
    commentId: string,
    reactionType: ReactionType
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking reaction:', error)
      return false
    }
  }

  /**
   * Parse mentions from content
   */
  static parseMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    const matches = content.match(mentionRegex)
    return matches ? matches.map(m => m.slice(1)) : []
  }

  /**
   * Subscribe to comments changes
   */
  static subscribeToGoalComments(goalId: string, callback: () => void) {
    const channel = supabase
      .channel(`comments:goal:${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
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
   * Subscribe to task comments changes
   */
  static subscribeToTaskComments(taskId: string, callback: () => void) {
    const channel = supabase
      .channel(`comments:task:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * Subscribe to reactions changes
   */
  static subscribeToReactions(commentId: string, callback: () => void) {
    const channel = supabase
      .channel(`reactions:${commentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_reactions',
          filter: `comment_id=eq.${commentId}`
        },
        () => callback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
