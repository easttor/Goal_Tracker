import React, { useState, useEffect } from 'react'
import { X, MessageCircle, Send, Heart, ThumbsUp, Award, Smile } from 'lucide-react'
import { CommentsService } from '../lib/commentsService'
import type { CommentEnhanced, ReactionType } from '../types'

interface CommentsPanelProps {
  goalId?: string
  taskId?: string
  teamGoalId?: string
  onClose: () => void
}

export function CommentsPanel({ goalId, taskId, teamGoalId, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentEnhanced[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadComments()
    
    // Subscribe to real-time updates
    let unsubscribe: (() => void) | undefined
    if (goalId) {
      unsubscribe = CommentsService.subscribeToGoalComments(goalId, loadComments)
    } else if (taskId) {
      unsubscribe = CommentsService.subscribeToTaskComments(taskId, loadComments)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [goalId, taskId, teamGoalId])

  const loadComments = async () => {
    setLoading(true)
    try {
      let data: CommentEnhanced[] = []
      if (goalId) {
        data = await CommentsService.getGoalComments(goalId)
      } else if (taskId) {
        data = await CommentsService.getTaskComments(taskId)
      } else if (teamGoalId) {
        data = await CommentsService.getTeamGoalComments(teamGoalId)
      }
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendComment = async () => {
    if (!newComment.trim()) return

    setSending(true)
    try {
      const mentions = CommentsService.parseMentions(newComment)
      
      if (goalId) {
        await CommentsService.createGoalComment(goalId, newComment, mentions, replyingTo || undefined)
      } else if (taskId) {
        await CommentsService.createTaskComment(taskId, newComment, mentions, replyingTo || undefined)
      } else if (teamGoalId) {
        await CommentsService.createTeamGoalComment(teamGoalId, newComment, mentions, replyingTo || undefined)
      }

      setNewComment('')
      setReplyingTo(null)
      await loadComments()
    } catch (error) {
      console.error('Error sending comment:', error)
    } finally {
      setSending(false)
    }
  }

  const handleReaction = async (commentId: string, reactionType: ReactionType) => {
    try {
      const hasReacted = await CommentsService.hasUserReacted(commentId, reactionType)
      if (hasReacted) {
        await CommentsService.removeReaction(commentId, reactionType)
      } else {
        await CommentsService.addReaction(commentId, reactionType)
      }
      await loadComments()
    } catch (error) {
      console.error('Error handling reaction:', error)
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

  const ReactionButton = ({ 
    icon: Icon, 
    type, 
    count, 
    commentId 
  }: { 
    icon: any, 
    type: ReactionType, 
    count: number, 
    commentId: string 
  }) => (
    <button
      onClick={() => handleReaction(commentId, type)}
      className="flex items-center space-x-1 px-2 py-1 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <Icon className="w-3 h-3" />
      {count > 0 && <span>{count}</span>}
    </button>
  )

  const CommentItem = ({ comment, isReply = false }: { comment: CommentEnhanced, isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {getInitials(comment.user?.display_name || comment.user?.username)}
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {comment.user?.display_name || comment.user?.username}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <ReactionButton 
              icon={Heart} 
              type="like" 
              count={comment.reactions?.filter(r => r.reaction_type === 'like').length || 0}
              commentId={comment.id}
            />
            <ReactionButton 
              icon={ThumbsUp} 
              type="support" 
              count={comment.reactions?.filter(r => r.reaction_type === 'support').length || 0}
              commentId={comment.id}
            />
            <ReactionButton 
              icon={Award} 
              type="celebrate" 
              count={comment.reactions?.filter(r => r.reaction_type === 'celebrate').length || 0}
              commentId={comment.id}
            />
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Reply
              </button>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comments
            </h2>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <div>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
              placeholder="Write a comment... (use @username to mention)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              disabled={sending}
            />
            <button
              onClick={handleSendComment}
              disabled={sending || !newComment.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Tip: Use @username to mention someone
          </p>
        </div>
      </div>
    </div>
  )
}
