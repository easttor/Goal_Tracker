import React, { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Calendar, Check } from 'lucide-react'
import { Goal, Task, ModalState } from '../types'
import { iconMap, getColorClasses } from '../lib/constants'
import { calculateProgress } from '../lib/utils'
import SearchAndFilter, { FilterState } from './SearchAndFilter'
import FloatingActionButton from './FloatingActionButton'
import { subscriptionService } from '../lib/subscriptionService'
import UpgradePrompt from './UpgradePrompt'
import UsageLimitWarning from './UsageLimitWarning'

interface GoalsScreenProps {
  goals: Goal[]
  goalRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>
  highlightGoalId: string | null
  onSetModal: (modal: ModalState) => void
  onToggleTask: (goalId: string, taskId: string | number) => void
  userId?: string
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ 
  goals, 
  goalRefs, 
  highlightGoalId, 
  onSetModal, 
  onToggleTask,
  userId 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    priority: 'all',
    status: 'all',
    sortBy: 'date'
  })
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ isPro: boolean; maxGoals: number }>({ isPro: false, maxGoals: 3 })

  // Filter and search logic
  const filteredGoals = useMemo(() => {
    let result = [...goals]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(goal => 
        goal.title.toLowerCase().includes(query) ||
        goal.description.toLowerCase().includes(query) ||
        goal.tasks.some(task => task.text.toLowerCase().includes(query))
      )
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(goal => 
        goal.tasks.some(task => task.priority === filters.priority)
      )
    }

    // Status filter
    if (filters.status === 'completed') {
      result = result.filter(goal => {
        const progress = calculateProgress(
          goal.tasks.filter(t => t.isComplete).length,
          goal.tasks.length
        )
        return progress === 100
      })
    } else if (filters.status === 'active') {
      result = result.filter(goal => {
        const progress = calculateProgress(
          goal.tasks.filter(t => t.isComplete).length,
          goal.tasks.length
        )
        return progress < 100
      })
    }

    // Sort
    switch (filters.sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'priority':
        result.sort((a, b) => {
          const getPriorityValue = (goal: Goal) => {
            const highCount = goal.tasks.filter(t => t.priority === 'high').length
            const mediumCount = goal.tasks.filter(t => t.priority === 'medium').length
            return highCount * 3 + mediumCount * 2
          }
          return getPriorityValue(b) - getPriorityValue(a)
        })
        break
      case 'dueDate':
        result.sort((a, b) => {
          const aDate = a.deadline || '9999-12-31'
          const bDate = b.deadline || '9999-12-31'
          return aDate.localeCompare(bDate)
        })
        break
      case 'date':
      default:
        result.sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime()
          const bTime = new Date(b.created_at || 0).getTime()
          return bTime - aTime
        })
    }

    return result
  }, [goals, searchQuery, filters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Load subscription status
  React.useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!userId) return
      try {
        const subscription = await subscriptionService.getUserSubscription(userId)
        const isPro = subscription?.plan?.name === 'Pro'
        const maxGoals = isPro ? 999999 : 3
        setSubscriptionStatus({ isPro, maxGoals })
      } catch (error) {
        console.error('Error loading subscription status:', error)
      }
    }
    loadSubscriptionStatus()
  }, [userId])

  const handleAddGoalClick = async () => {
    if (!userId) {
      onSetModal({ type: 'addGoal', data: {} })
      return
    }

    try {
      const check = await subscriptionService.canPerformAction(userId, 'goals')
      if (!check.allowed) {
        setShowUpgradePrompt(true)
        return
      }
      onSetModal({ type: 'addGoal', data: {} })
    } catch (error) {
      console.error('Error checking limits:', error)
      onSetModal({ type: 'addGoal', data: {} }) // Allow on error
    }
  }

  return (
    <div id="goalsScreen" className="fade-in relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/goals_background_9.jpg)',
          filter: 'brightness(0.3)'
        }}
      />
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm -z-10" />
      
      <header className="p-4 pt-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          My Goals
        </h1>
        
        {/* Search and Filter */}
        <SearchAndFilter 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          showFilters={true}
        />
      </header>

      {/* Usage Limit Warning */}
      {!subscriptionStatus.isPro && userId && (
        <div className="px-4">
          <UsageLimitWarning
            currentCount={goals.length}
            maxCount={subscriptionStatus.maxGoals}
            itemName="goal"
            onUpgrade={() => setShowUpgradePrompt(true)}
          />
        </div>
      )}

      {/* Results info */}
      {(searchQuery || filters.priority !== 'all' || filters.status !== 'all') && (
        <div className="px-4 pb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredGoals.length} of {goals.length} goals
          </p>
        </div>
      )}

      <div id="myGoalsContainer" className="p-4 space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onSetModal={onSetModal} 
              onToggleTask={onToggleTask}
              isHighlighted={highlightGoalId === goal.id}
              ref={el => goalRefs.current[goal.id] = el}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No goals found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {searchQuery || filters.priority !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first goal to get started'}
            </p>
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={handleAddGoalClick}
        label="Add Goal"
      />

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            setShowUpgradePrompt(false)
            window.location.href = '/#subscription'
          }}
          reason={`You've reached the Free plan limit of 3 goals`}
          feature="unlimited goals"
        />
      )}
    </div>
  )
}

interface GoalCardProps {
  goal: Goal
  onSetModal: (modal: ModalState) => void
  onToggleTask: (goalId: string, taskId: number) => void
  isHighlighted: boolean
}

const GoalCard = React.forwardRef<HTMLDivElement, GoalCardProps>(
  ({ goal, onSetModal, onToggleTask, isHighlighted }, ref) => {
    const totalTasks = goal.tasks.length
    const completedTasks = goal.tasks.filter(t => t.isComplete).length
    const progress = calculateProgress(completedTasks, totalTasks)
    const IconComponent = iconMap[goal.icon as keyof typeof iconMap] || iconMap.Target
    const imageUrl = goal.image_url || `https://placehold.co/600x400/${goal.color}-100/FFF?text=Goal`
    const colors = getColorClasses(goal.color)

    return (
      <div 
        ref={ref} 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden dynamic-goal hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
          isHighlighted ? 'ring-4 ring-blue-500 ring-offset-2' : ''
        }`}
      >
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={goal.title} 
            className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105" 
            onError={(e) => { 
              e.currentTarget.src = 'https://placehold.co/600x400/eee/999?text=Image+Not+Found' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{goal.title}</h3>
            <span className={`${colors.icon} p-2.5 rounded-xl text-white shadow-md transition-transform duration-200 hover:scale-110`}>
              <IconComponent className="w-5 h-5" />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{goal.description}</p>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Progress ({completedTasks}/{totalTasks} tasks)
            </span>
            <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
          </div>
          <div className={`w-full ${colors.progressBg} rounded-full h-3 overflow-hidden shadow-inner`}>
            <div 
              className={`${colors.progressFill} h-3 rounded-full transition-all duration-600 ease-out shadow-sm`} 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="mt-5">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Tasks</h4>
            <div className="space-y-3 mb-4">
              {goal.tasks.length > 0 ? (
                goal.tasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    goalId={goal.id}
                    goalColor={goal.color}
                    onToggleTask={onToggleTask}
                    onSetModal={onSetModal}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-3">No tasks added yet.</p>
              )}
            </div>
            <button 
              className={`w-full text-sm font-semibold ${colors.text} ${colors.bgLight} ${colors.hover} rounded-xl py-2.5 text-center transition-all duration-200 hover:shadow-md active:scale-95`}
              onClick={() => onSetModal({ type: 'addTask', data: { goalId: goal.id } })}
            >
              <Plus className="w-4 h-4 inline-block mr-1" /> Add Task
            </button>
          </div>
          
          <div className="flex justify-end space-x-2 mt-5 pt-5 border-t-2 border-gray-100 dark:border-gray-700">
            <button 
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg py-2 px-4 flex items-center transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={() => onSetModal({ type: 'editGoal', data: { id: goal.id } })}
            >
              <Pencil className="w-4 h-4 mr-1.5" /> Edit
            </button>
            <button 
              className="text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg py-2 px-4 flex items-center transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={() => onSetModal({ type: 'delete', data: { goalId: goal.id } })}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </button>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-4 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">Target: {goal.deadline || 'No deadline set'}</span>
          </div>
        </div>
      </div>
    )
  }
)

interface TaskItemProps {
  task: Task
  goalId: string
  goalColor: string
  onToggleTask: (goalId: string, taskId: string | number) => void
  onSetModal: (modal: ModalState) => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, goalId, goalColor, onToggleTask, onSetModal }) => {
  const colors = getColorClasses(goalColor)
  
  // Priority badge
  const priorityBadge = task.priority && task.priority !== 'medium' ? (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      task.priority === 'high' 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }`}>
      {task.priority}
    </span>
  ) : null
  
  return (
    <div className="flex items-center group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200">
      <div 
        className={`w-6 h-6 rounded-lg ${
          task.isComplete 
            ? `${colors.checkbox} text-white shadow-md` 
            : 'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } flex-shrink-0 flex items-center justify-center mr-3 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95`} 
        onClick={() => onToggleTask(goalId, task.id)}
      >
        {task.isComplete && <Check className="w-4 h-4 checkmark-animate" />}
      </div>
      <div className="flex-1 flex flex-col cursor-pointer" onClick={() => onToggleTask(goalId, task.id)}>
        <span 
          className={`${task.isComplete ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 font-medium'} transition-all duration-200`}
        >
          {task.text}
        </span>
        {task.description && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}
          </span>
        )}
      </div>
      {priorityBadge && <span className="ml-2">{priorityBadge}</span>}
      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 mr-2 font-medium">{task.dueDate}</span>
      <button 
        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
        onClick={() => onSetModal({ type: 'editTask', data: { goalId: goalId, taskId: task.id } })}
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button 
        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
        onClick={() => onSetModal({ type: 'delete', data: { goalId: goalId, taskId: task.id } })}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

GoalCard.displayName = 'GoalCard'

export default GoalsScreen
