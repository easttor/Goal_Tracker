import React, { useState, useEffect } from 'react'
import { X, Share2, UserPlus, Trash2, Users } from 'lucide-react'
import { SharingService } from '../lib/sharingService'
import { SocialService } from '../lib/socialService'
import type { GoalShare, UserProfile, PermissionLevel } from '../types'

interface GoalSharingModalProps {
  goalId: string
  goalTitle: string
  onClose: () => void
}

export function GoalSharingModal({ goalId, goalTitle, onClose }: GoalSharingModalProps) {
  const [shares, setShares] = useState<GoalShare[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>('viewer')

  useEffect(() => {
    loadShares()
  }, [goalId])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadShares = async () => {
    setLoading(true)
    try {
      const data = await SharingService.getGoalShares(goalId)
      setShares(data)
    } catch (error) {
      console.error('Error loading shares:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      const results = await SocialService.searchUsers(searchQuery)
      // Filter out users who already have access
      const existingUserIds = shares.map(s => s.shared_with_user_id)
      setSearchResults(results.filter(u => !existingUserIds.includes(u.id)))
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const handleShareWithUser = async (userId: string) => {
    try {
      await SharingService.shareGoal(goalId, userId, selectedPermission)
      await loadShares()
      setSearchQuery('')
      setSearchResults([])
      setShowUserSearch(false)
    } catch (error) {
      console.error('Error sharing goal:', error)
    }
  }

  const handleUpdatePermission = async (shareId: string, permission: PermissionLevel) => {
    try {
      await SharingService.updateSharePermission(shareId, permission)
      await loadShares()
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm('Remove access for this user?')) return
    
    try {
      await SharingService.removeShare(shareId)
      await loadShares()
    } catch (error) {
      console.error('Error removing share:', error)
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

  const getPermissionLabel = (level: PermissionLevel) => {
    switch (level) {
      case 'viewer': return 'Can View'
      case 'collaborator': return 'Can Edit'
      case 'admin': return 'Full Access'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share Goal
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {goalTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Add User Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {!showUserSearch ? (
            <button
              onClick={() => setShowUserSearch(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add People</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as PermissionLevel)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="viewer">Can View</option>
                  <option value="collaborator">Can Edit</option>
                  <option value="admin">Full Access</option>
                </select>
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleShareWithUser(user.id)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(user.display_name || user.username)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.display_name || user.username}
                        </p>
                        {user.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Shares */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            People with access ({shares.length})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No one else has access yet</p>
              <p className="text-sm mt-1">Share this goal to collaborate with others</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(share.shared_with_user?.display_name || share.shared_with_user?.username)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {share.shared_with_user?.display_name || share.shared_with_user?.username}
                      </p>
                      {share.shared_with_user?.username && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{share.shared_with_user.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={share.permission_level}
                      onChange={(e) => handleUpdatePermission(share.id, e.target.value as PermissionLevel)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="viewer">Can View</option>
                      <option value="collaborator">Can Edit</option>
                      <option value="admin">Full Access</option>
                    </select>
                    <button
                      onClick={() => handleRemoveShare(share.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
