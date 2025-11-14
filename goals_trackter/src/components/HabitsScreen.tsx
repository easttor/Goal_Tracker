import React, { useState, useEffect } from 'react'
import { Plus, Flame, TrendingUp, Calendar as CalendarIcon, Check, X } from 'lucide-react'
import { Habit, HabitCompletion } from '../types'
import { HabitsService } from '../lib/habitsService'

interface HabitsScreenProps {
  userId: string
}

const HabitsScreen: React.FC<HabitsScreenProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadHabits()
    
    // Subscribe to real-time changes
    const subscription = HabitsService.subscribeToHabitChanges(userId, (updatedHabits) => {
      setHabits(updatedHabits)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const data = await HabitsService.getHabits(userId)
      setHabits(data)
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    try {
      const isCompleted = await HabitsService.isHabitCompleted(habitId, selectedDate)
      
      if (isCompleted) {
        await HabitsService.uncompleteHabit(habitId, selectedDate)
      } else {
        await HabitsService.completeHabit(userId, habitId, selectedDate)
      }
      
      // Reload habits to get updated streak info
      await loadHabits()
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading habits...</div>
      </div>
    )
  }

  return (
    <div id="habitsScreen" className="fade-in">
      {/* Header */}
      <header className="p-4 pt-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Daily Habits
            </h1>
            <p className="text-gray-600 text-sm mt-1">Build consistency, one day at a time</p>
          </div>
          <button 
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-purple-600" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 p-2 border-none focus:outline-none text-sm font-medium"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </header>

      {/* Habits List */}
      <div className="p-4 space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No habits yet</h3>
            <p className="text-gray-500 mb-4">Start building positive habits today!</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              selectedDate={selectedDate}
              onToggle={handleToggleHabit}
              userId={userId}
            />
          ))
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal 
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadHabits()
          }}
        />
      )}
    </div>
  )
}

interface HabitCardProps {
  habit: Habit
  selectedDate: string
  onToggle: (habitId: string) => void
  userId: string
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDate, onToggle, userId }) => {
  const [isCompleted, setIsCompleted] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkCompletion()
    loadStats()
  }, [habit.id, selectedDate])

  const checkCompletion = async () => {
    const completed = await HabitsService.isHabitCompleted(habit.id, selectedDate)
    setIsCompleted(completed)
  }

  const loadStats = async () => {
    try {
      const habitStats = await HabitsService.getHabitStats(habit.id)
      setStats(habitStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      daily: 'Every day',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom'
    }
    return labels[frequency] || frequency
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
      isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600">{habit.description}</p>
          )}
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span>{getFrequencyLabel(habit.frequency)}</span>
          </div>
        </div>

        {/* Completion Button */}
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-300'
          }`}
        >
          {isCompleted ? (
            <Check className="w-8 h-8" />
          ) : (
            <X className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      {/* Streak Information */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Flame className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-2xl font-bold text-orange-600">{habit.current_streak}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Current Streak</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-2xl font-bold text-blue-600">{habit.best_streak}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Best Streak</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Check className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-2xl font-bold text-green-600">{stats?.totalCompletions || 0}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Total</p>
        </div>
      </div>

      {/* Completion Rate */}
      {stats && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span className="font-semibold">{Math.round(stats.completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.completionRate)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface AddHabitModalProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ userId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    target_count: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await HabitsService.createHabit(userId, formData)
      onSuccess()
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Habit
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Habit Name
              </label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., Morning Exercise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                placeholder="Add details..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="daily">Every Day</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t-2 border-gray-100">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Create Habit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HabitsScreen
