import React, { useState, useEffect } from 'react'
import { 
  Plus, Flame, TrendingUp, Calendar as CalendarIcon, Check, X, 
  Filter, Search, Trophy, Target, Award, BookOpen, Brain, 
  Droplet, Apple, PenTool, Lightbulb, Users, DollarSign, 
  Palette, Activity, Heart, Sparkles, Star, Play, Pause,
  ChevronDown, SlidersHorizontal, Edit, Trash2
} from 'lucide-react'
import { Habit, HabitTemplate, HabitAchievement, HabitCategory } from '../types'
import { HabitsService } from '../lib/habitsService'
import { subscriptionService } from '../lib/subscriptionService'
import UpgradePrompt from './UpgradePrompt'
import UsageLimitWarning from './UsageLimitWarning'

interface HabitsScreenEnhancedProps {
  userId: string
}

// Category configuration with icons and colors
const CATEGORIES: { value: HabitCategory; label: string; icon: any; color: string }[] = [
  { value: 'health', label: 'Health', icon: Heart, color: 'red' },
  { value: 'productivity', label: 'Productivity', icon: Target, color: 'blue' },
  { value: 'learning', label: 'Learning', icon: BookOpen, color: 'indigo' },
  { value: 'wellness', label: 'Wellness', icon: Sparkles, color: 'purple' },
  { value: 'fitness', label: 'Fitness', icon: Activity, color: 'orange' },
  { value: 'nutrition', label: 'Nutrition', icon: Apple, color: 'green' },
  { value: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'pink' },
  { value: 'social', label: 'Social', icon: Users, color: 'teal' },
  { value: 'creative', label: 'Creative', icon: Palette, color: 'yellow' },
  { value: 'finance', label: 'Finance', icon: DollarSign, color: 'cyan' }
]

// Color schemes for habit cards
const COLOR_SCHEMES: { [key: string]: { bg: string; border: string; text: string; badge: string } } = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500' },
  red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', badge: 'bg-pink-500' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700', badge: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-500' }
}

const HabitsScreenEnhanced: React.FC<HabitsScreenEnhancedProps> = ({ userId }) => {
  const [habits, setHabits] = useState<Habit[]>([])
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all')
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ isPro: boolean; maxHabits: number }>({ isPro: false, maxHabits: 3 })

  useEffect(() => {
    loadHabits()
    loadWeeklyStats()
    loadSubscriptionStatus()
    
    // Subscribe to real-time changes
    const subscription = HabitsService.subscribeToHabitChanges(userId, (updatedHabits) => {
      setHabits(updatedHabits)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  useEffect(() => {
    filterHabits()
  }, [habits, searchTerm, selectedCategory])

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

  const loadWeeklyStats = async () => {
    try {
      const stats = await HabitsService.getWeeklyStats(userId)
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Error loading weekly stats:', error)
    }
  }

  const loadSubscriptionStatus = async () => {
    try {
      const subscription = await subscriptionService.getUserSubscription(userId)
      const isPro = subscription?.plan?.name === 'Pro'
      const maxHabits = isPro ? 999999 : 3 // Effectively unlimited for pro users
      setSubscriptionStatus({ isPro, maxHabits })
    } catch (error) {
      console.error('Error loading subscription status:', error)
    }
  }

  const filterHabits = () => {
    let filtered = [...habits]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(h => h.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredHabits(filtered)
  }

  const handleAddHabitClick = async () => {
    try {
      const check = await subscriptionService.canPerformAction(userId, 'habits')
      if (!check.allowed) {
        setShowUpgradePrompt(true)
        return
      }
      setShowAddModal(true)
    } catch (error) {
      console.error('Error checking limits:', error)
      setShowAddModal(true) // Allow on error
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
      
      // Reload habits and stats
      await loadHabits()
      await loadWeeklyStats()
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const handleHabitSaved = async () => {
    // Increment usage count after successfully adding a habit
    try {
      await subscriptionService.incrementUsage(userId, 'habits')
      await loadHabits()
      await loadWeeklyStats()
    } catch (error) {
      console.error('Error updating usage:', error)
    }
  }

  const handleHabitDeleted = async () => {
    // Decrement usage count after deleting a habit
    try {
      await subscriptionService.decrementUsage(userId, 'habits')
      await loadHabits()
      await loadWeeklyStats()
    } catch (error) {
      console.error('Error updating usage:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div 
      id="habitsScreenEnhanced" 
      className="relative min-h-screen fade-in"
      style={{
        backgroundImage: 'url(/images/habits-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Glass Effect */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
          <div className="p-4 pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Daily Habits
                </h1>
                <p className="text-gray-600 text-sm mt-1">Build consistency, one day at a time</p>
              </div>
              <button 
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleAddHabitClick}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Weekly Stats */}
            {weeklyStats && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="glass-card p-3 text-center rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{weeklyStats.totalHabits}</div>
                  <div className="text-xs text-gray-600 mt-1">Total</div>
                </div>
                <div className="glass-card p-3 text-center rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{weeklyStats.completedToday}</div>
                  <div className="text-xs text-gray-600 mt-1">Today</div>
                </div>
                <div className="glass-card p-3 text-center rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{weeklyStats.weekCompletion}</div>
                  <div className="text-xs text-gray-600 mt-1">This Week</div>
                </div>
                <div className="glass-card p-3 text-center rounded-xl">
                  <div className="flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500 mr-1" />
                    <div className="text-2xl font-bold text-orange-600">{weeklyStats.topStreak}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Top Streak</div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-2">
              {/* Date Selector */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2 glass-card rounded-xl p-2">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass-card p-2.5 rounded-xl transition-all duration-200 ${showFilters ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-50'}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-2 glass-card rounded-xl p-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search habits..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                />
              </div>

              {/* Category Filters */}
              {showFilters && (
                <div className="glass-card rounded-xl p-3 space-y-2 animate-in">
                  <div className="text-xs font-semibold text-gray-600 mb-2">FILTER BY CATEGORY</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
                            selectedCategory === cat.value
                              ? `bg-${cat.color}-500 text-white shadow-md`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex-1 glass-card rounded-xl p-3 flex items-center justify-center space-x-2 hover:bg-purple-50 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Use Template</span>
              </button>
            </div>
          </div>
        </header>

        {/* Habits List */}
        <div className="p-4 space-y-4 pb-20">
          {/* Usage Limit Warning */}
          {!subscriptionStatus.isPro && (
            <UsageLimitWarning
              currentCount={habits.length}
              maxCount={subscriptionStatus.maxHabits}
              itemName="habit"
              onUpgrade={() => setShowUpgradePrompt(true)}
            />
          )}

          {filteredHabits.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <div className="text-6xl mb-4">
                <Target className="w-20 h-20 mx-auto text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No habits found' : 'No habits yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start building positive habits today!'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Create Your First Habit
                </button>
              )}
            </div>
          ) : (
            filteredHabits.map(habit => (
              <EnhancedHabitCard 
                key={habit.id} 
                habit={habit} 
                selectedDate={selectedDate}
                onToggle={handleToggleHabit}
                onEdit={(habit) => {
                  setEditingHabit(habit)
                  setShowEditModal(true)
                }}
                onDelete={(habitId) => {
                  setDeletingHabitId(habitId)
                  setShowDeleteConfirm(true)
                }}
                onRefresh={loadHabits}
                userId={userId}
              />
            ))
          )}
        </div>

        {/* Add Habit Modal */}
        {showAddModal && (
          <AddHabitModalEnhanced 
            userId={userId}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              loadHabits()
              loadWeeklyStats()
            }}
          />
        )}

        {/* Edit Habit Modal */}
        {showEditModal && editingHabit && (
          <AddHabitModalEnhanced 
            userId={userId}
            onClose={() => {
              setShowEditModal(false)
              setEditingHabit(null)
            }}
            onSuccess={() => {
              setShowEditModal(false)
              setEditingHabit(null)
              loadHabits()
              loadWeeklyStats()
            }}
            editMode={true}
            habitData={editingHabit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingHabitId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Habit</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this habit? All completion history and achievements will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingHabitId(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await HabitsService.deleteHabit(deletingHabitId)
                      setShowDeleteConfirm(false)
                      setDeletingHabitId(null)
                      loadHabits()
                      loadWeeklyStats()
                    } catch (error) {
                      console.error('Error deleting habit:', error)
                    }
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <TemplatesModal 
            userId={userId}
            onClose={() => setShowTemplates(false)}
            onSuccess={() => {
              setShowTemplates(false)
              loadHabits()
              loadWeeklyStats()
            }}
          />
        )}

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <UpgradePrompt
            onClose={() => setShowUpgradePrompt(false)}
            onUpgrade={() => {
              setShowUpgradePrompt(false)
              window.location.href = '/#subscription'
            }}
            reason={`You've reached the Free plan limit of 3 habits`}
            feature="unlimited habits"
          />
        )}
      </div>
    </div>
  )
}

// Enhanced Habit Card Component
interface EnhancedHabitCardProps {
  habit: Habit
  selectedDate: string
  onToggle: (habitId: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onRefresh: () => void
  userId: string
}

const EnhancedHabitCard: React.FC<EnhancedHabitCardProps> = ({ habit, selectedDate, onToggle, onEdit, onDelete, onRefresh, userId }) => {
  const [isCompleted, setIsCompleted] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<HabitAchievement[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkCompletion()
    loadStats()
    loadAchievements()
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

  const loadAchievements = async () => {
    try {
      const habitAchievements = await HabitsService.getHabitAchievements(habit.id)
      setAchievements(habitAchievements.slice(0, 3)) // Show top 3
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const colorScheme = COLOR_SCHEMES[habit.color] || COLOR_SCHEMES.purple
  const category = CATEGORIES.find(c => c.value === habit.category)
  const CategoryIcon = category?.icon || Target

  return (
    <div 
      className={`glass-card rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
        isCompleted ? `${colorScheme.bg} ${colorScheme.border}` : 'border-gray-100 hover:border-gray-200'
      } ${habit.is_paused ? 'opacity-60' : ''}`}
    >
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mb-3">
        <button
          onClick={() => onEdit(habit)}
          className="glass-card p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
          title="Edit habit"
        >
          <Edit className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="glass-card p-2 rounded-lg hover:bg-red-50 transition-all duration-200 group"
          title="Delete habit"
        >
          <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
        </button>
      </div>

      {/* Habit Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {/* Category Badge */}
            <div className={`${colorScheme.badge} text-white px-2 py-1 rounded-lg flex items-center space-x-1`}>
              <CategoryIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{category?.label}</span>
            </div>
            
            {/* Pause Badge */}
            {habit.is_paused && (
              <div className="bg-gray-400 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                <Pause className="w-3 h-3" />
                <span className="text-xs font-medium">Paused</span>
              </div>
            )}
          </div>

          <h3 className={`text-lg font-bold mb-1 ${isCompleted ? colorScheme.text : 'text-gray-800'}`}>
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{habit.description}</p>
          )}
          
          {/* Frequency & Difficulty */}
          <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              <span className="capitalize">{habit.frequency}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              <span className="capitalize">{habit.difficulty_level}</span>
            </div>
          </div>
        </div>

        {/* Completion Button */}
        <button
          onClick={() => onToggle(habit.id)}
          disabled={habit.is_paused}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-300'
          } ${habit.is_paused ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCompleted ? (
            <Check className="w-8 h-8" />
          ) : (
            <X className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      {/* Achievements Preview */}
      {achievements.length > 0 && (
        <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-100">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <div className="flex space-x-1">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  achievement.badge_color === 'gold' ? 'bg-yellow-500' :
                  achievement.badge_color === 'silver' ? 'bg-gray-400' :
                  achievement.badge_color === 'bronze' ? 'bg-orange-600' :
                  'bg-purple-500'
                }`}
                title={achievement.title}
              >
                {achievement.achievement_type.includes('streak') ? '🔥' : '✓'}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">{achievements.length} achieved</span>
        </div>
      )}

      {/* Streak Information */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Flame className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-2xl font-bold text-orange-600">{habit.current_streak}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Current</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-2xl font-bold text-blue-600">{habit.best_streak}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Best</p>
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
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`${colorScheme.badge} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, stats.completionRate)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Add Habit Modal (Enhanced)
interface AddHabitModalEnhancedProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
  editMode?: boolean
  habitData?: Habit
}

const AddHabitModalEnhanced: React.FC<AddHabitModalEnhancedProps> = ({ userId, onClose, onSuccess, editMode = false, habitData }) => {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: HabitCategory
    color: string
    icon: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    target_count: number
    reminder_enabled: boolean
    notes_enabled: boolean
    photos_enabled: boolean
  }>({
    title: habitData?.title || '',
    description: habitData?.description || '',
    category: habitData?.category || 'wellness',
    color: habitData?.color || 'purple',
    icon: habitData?.icon || 'target',
    frequency: habitData?.frequency || 'daily',
    difficulty_level: habitData?.difficulty_level || 'beginner',
    target_count: habitData?.target_count || 1,
    reminder_enabled: habitData?.reminder_enabled || false,
    notes_enabled: habitData?.notes_enabled !== undefined ? habitData.notes_enabled : true,
    photos_enabled: habitData?.photos_enabled || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editMode && habitData) {
        await HabitsService.updateHabit(habitData.id, {
          ...formData
        } as Partial<Habit>)
      } else {
        await HabitsService.createHabit(userId, {
          ...formData,
          current_streak: 0,
          best_streak: 0,
          is_paused: false
        } as Partial<Habit>)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 modal-enter">
      <div className="glass-card rounded-2xl max-w-md w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {editMode ? 'Edit Habit' : 'Create New Habit'}
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
                Description
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                placeholder="Add details..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as HabitCategory })}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 capitalize"
                >
                  {Object.keys(COLOR_SCHEMES).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 capitalize"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
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

// Templates Modal Component
interface TemplatesModalProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const TemplatesModal: React.FC<TemplatesModalProps> = ({ userId, onClose, onSuccess }) => {
  const [templates, setTemplates] = useState<HabitTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await HabitsService.getHabitTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    try {
      await HabitsService.createHabitFromTemplate(userId, templateId)
      onSuccess()
    } catch (error) {
      console.error('Error using template:', error)
    }
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 modal-enter">
      <div className="glass-card rounded-2xl max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Habit Templates
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map(template => {
                const category = CATEGORIES.find(c => c.value === template.category)
                const CategoryIcon = category?.icon || Target
                const colorScheme = COLOR_SCHEMES[template.color] || COLOR_SCHEMES.purple

                return (
                  <div 
                    key={template.id}
                    className={`${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl p-4 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className={`${colorScheme.badge} text-white px-2 py-1 rounded-lg inline-flex items-center space-x-1 mb-2`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">{category?.label}</span>
                        </div>
                        <h3 className={`font-bold ${colorScheme.text} mb-1`}>{template.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        <span className="capitalize">{template.frequency}</span> · <span className="capitalize">{template.difficulty_level}</span>
                      </div>
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-all duration-200"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HabitsScreenEnhanced
