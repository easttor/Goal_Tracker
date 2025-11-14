import React, { useState, useEffect } from 'react'
import { MilestonesService } from '../lib/milestonesService'
import { Milestone } from '../types'

interface MilestonesPanelProps {
  goalId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function MilestonesPanel({ goalId, userId, isOpen, onClose }: MilestonesPanelProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMilestone, setNewMilestone] = useState({ title: '', target_value: 100 })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (isOpen && goalId) {
      loadMilestones()
    }
  }, [isOpen, goalId])

  const loadMilestones = async () => {
    try {
      setIsLoading(true)
      const data = await MilestonesService.getMilestones(goalId)
      setMilestones(data)
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) return

    try {
      await MilestonesService.createMilestone(
        userId,
        goalId,
        {
          title: newMilestone.title,
          description: '',
          target_value: newMilestone.target_value,
          current_value: 0,
          unit: 'percent'
        }
      )
      setNewMilestone({ title: '', target_value: 100 })
      setShowAddForm(false)
      loadMilestones()
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  const handleUpdateProgress = async (milestoneId: string, newValue: number) => {
    try {
      await MilestonesService.updateProgress(milestoneId, newValue)
      loadMilestones()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleMarkAchieved = async (milestoneId: string, targetValue: number) => {
    try {
      // Mark as achieved by setting current value to target
      await MilestonesService.updateProgress(milestoneId, targetValue)
      loadMilestones()
    } catch (error) {
      console.error('Error marking milestone achieved:', error)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return
    
    try {
      await MilestonesService.deleteMilestone(milestoneId)
      loadMilestones()
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Milestones</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 mt-1 text-sm">Track your progress with measurable milestones</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading milestones...</div>
          ) : (
            <>
              {/* Milestones List */}
              <div className="space-y-4 mb-6">
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-lg mb-2">🎯 No milestones yet</p>
                    <p className="text-sm">Add milestones to track your progress</p>
                  </div>
                ) : (
                  milestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className={`bg-gray-50 rounded-xl p-4 border-2 transition-all ${
                        milestone.is_achieved
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {milestone.is_achieved && '✅ '}
                            {milestone.title}
                          </h3>
                          {milestone.description && (
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="text-gray-400 hover:text-red-500 text-xl ml-2"
                        >
                          ×
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-purple-600">
                            {milestone.current_value} / {milestone.target_value} {milestone.unit}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              milestone.is_achieved
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                (milestone.current_value / milestone.target_value) * 100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      {!milestone.is_achieved && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={milestone.current_value}
                            onChange={(e) =>
                              handleUpdateProgress(milestone.id, Number(e.target.value))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            max={milestone.target_value}
                            min={0}
                          />
                          {milestone.current_value >= milestone.target_value && (
                            <button
                              onClick={() => handleMarkAchieved(milestone.id, milestone.target_value)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      )}

                      {milestone.is_achieved && milestone.achieved_at && (
                        <p className="text-xs text-green-600 mt-2">
                          Achieved on {new Date(milestone.achieved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Milestone Form */}
              {showAddForm ? (
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-300">
                  <h3 className="font-semibold text-gray-800 mb-3">Add New Milestone</h3>
                  <input
                    type="text"
                    placeholder="Milestone title"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  />
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={newMilestone.target_value}
                      onChange={(e) =>
                        setNewMilestone({ ...newMilestone, target_value: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddMilestone}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                    >
                      Add Milestone
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setNewMilestone({ title: '', target_value: 100 })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
                >
                  + Add New Milestone
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
