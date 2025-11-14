import React, { useState, useEffect } from 'react'
import { Users, Plus, UserPlus, Settings, TrendingUp, Calendar } from 'lucide-react'
import { SharingService } from '../lib/sharingService'
import { SocialService } from '../lib/socialService'
import type { TeamGoal, UserProfile } from '../types'

export function TeamGoalsScreen() {
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamGoal | null>(null)

  useEffect(() => {
    loadTeamGoals()
  }, [])

  const loadTeamGoals = async () => {
    setLoading(true)
    try {
      const data = await SharingService.getMyTeamGoals()
      setTeamGoals(data)
    } catch (error) {
      console.error('Error loading team goals:', error)
    } finally {
      setLoading(false)
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
    if (!date) return 'No deadline'
    return new Date(date).toLocaleDateString()
  }

  const getProgressPercentage = (current: number, target?: number) => {
    if (!target) return 0
    return Math.min(Math.round((current / target) * 100), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 pb-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Goals
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Collaborate with others to achieve shared goals
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Team Goal</span>
          </button>
        </div>

        {/* Team Goals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : teamGoals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Team Goals Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a team goal to start collaborating with others
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Team Goal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamGoals.map((team) => (
              <div
                key={team.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedTeam(team)}
              >
                {/* Team Header */}
                <div 
                  className="p-6 text-white"
                  style={{ backgroundColor: team.color }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {team.icon && <span className="text-2xl">{team.icon}</span>}
                      <h3 className="text-xl font-bold">{team.title}</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open team settings
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                  {team.description && (
                    <p className="text-sm opacity-90 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                </div>

                {/* Team Body */}
                <div className="p-6">
                  {/* Progress */}
                  {team.target_value && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {getProgressPercentage(team.current_value, team.target_value)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${getProgressPercentage(team.current_value, team.target_value)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{team.current_value} completed</span>
                        <span>{team.target_value} target</span>
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team Members
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Open add member modal
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="flex items-center -space-x-2">
                      {team.members && team.members.slice(0, 5).map((member, index) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
                          style={{ zIndex: 5 - index }}
                          title={member.user?.display_name || member.user?.username}
                        >
                          {getInitials(member.user?.display_name || member.user?.username)}
                        </div>
                      ))}
                      {team.member_count && team.member_count > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
                          +{team.member_count - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deadline */}
                  {team.deadline && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formatDate(team.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Created by {team.creator?.display_name || team.creator?.username}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      team.is_active
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {team.is_active ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Goal Modal */}
      {showCreateModal && (
        <CreateTeamGoalModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadTeamGoals()
          }}
        />
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onUpdate={loadTeamGoals}
        />
      )}
    </div>
  )
}

// Create Team Goal Modal Component
function CreateTeamGoalModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    color: '#8B5CF6',
    target_value: 100,
    deadline: ''
  })
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!formData.title.trim()) return

    setCreating(true)
    try {
      await SharingService.createTeamGoal(formData)
      onCreated()
    } catch (error) {
      console.error('Error creating team goal:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Team Goal
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Team Goal Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="What is this team goal about?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Value
              </label>
              <input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !formData.title.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Team Goal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Team Details Modal Component (Placeholder)
function TeamDetailsModal({ team, onClose, onUpdate }: { team: TeamGoal, onClose: () => void, onUpdate: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {team.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {team.description}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
