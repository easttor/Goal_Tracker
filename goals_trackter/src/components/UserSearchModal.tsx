import React, { useState, useEffect } from 'react'
import { X, Search, UserPlus, UserCheck, Users } from 'lucide-react'
import { SocialService } from '../lib/socialService'
import type { UserProfile } from '../types'

interface UserSearchModalProps {
  onClose: () => void
  onUserSelect?: (user: UserProfile) => void
}

export function UserSearchModal({ onClose, onUserSelect }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [followingStatus, setFollowingStatus] = useState<{ [userId: string]: boolean }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const results = await SocialService.searchUsers(searchQuery)
      setSearchResults(results)

      // Check following status for each result
      const statusMap: { [userId: string]: boolean } = {}
      await Promise.all(
        results.map(async (user) => {
          const isFollowing = await SocialService.isFollowing(user.id)
          statusMap[user.id] = isFollowing
        })
      )
      setFollowingStatus(statusMap)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async (userId: string, currentlyFollowing: boolean) => {
    try {
      if (currentlyFollowing) {
        await SocialService.unfollowUser(userId)
        setFollowingStatus(prev => ({ ...prev, [userId]: false }))
      } else {
        await SocialService.followUser(userId)
        setFollowingStatus(prev => ({ ...prev, [userId]: true }))
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
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

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Find Users
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter at least 2 characters to search</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onUserSelect?.(user)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.display_name || user.username)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.display_name || user.username}
                      </h3>
                      {user.username && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                      )}
                      {user.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFollowToggle(user.id, followingStatus[user.id] || false)
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      followingStatus[user.id]
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {followingStatus[user.id] ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
