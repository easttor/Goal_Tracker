import React, { useState, useEffect, useMemo, useRef } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { GoalsService } from './lib/goalsService'
import { Goal, Task, ModalState } from './types'
import { getTodayDateString } from './lib/utils'
import { NotificationsService } from './lib/notificationsService'

// Import screen components
import AuthScreen from './components/AuthScreen'
import DiaryScreen from './components/DiaryScreen'
import GoalsScreen from './components/GoalsScreen'
import StatisticsScreen from './components/StatisticsScreen'
import UserProfileScreen from './components/UserProfileScreen'
import HabitsScreenEnhanced from './components/HabitsScreenEnhanced'
import CalendarScreen from './components/CalendarScreen'
import NavBar from './components/NavBar'
import GoalModal from './components/GoalModal'
import TaskModalEnhanced from './components/TaskModalEnhanced'
import DeleteModal from './components/DeleteModal'

import SplashScreen from './components/SplashScreen'
import GoalTemplatesBrowser from './components/GoalTemplatesBrowser'
import NotificationsCenter from './components/NotificationsCenter'
import { GoalTemplate } from './lib/goalTemplatesService'
import SubscriptionPlansScreen from './components/SubscriptionPlansScreen'

function AppContent() {
    const { user, loading } = useAuth()
    
    console.log('[App] Rendering AppContent - user:', user ? 'logged in' : 'not logged in', 'loading:', loading)
    
    // App State
    const [goals, setGoals] = useState<Goal[]>([])
    const [currentPage, setCurrentPage] = useState<string>('diary')
    const [modal, setModal] = useState<ModalState>({ type: null, data: {} })
    const [highlightGoalId, setHighlightGoalId] = useState<string | null>(null)
    const [isLoadingGoals, setIsLoadingGoals] = useState(true)
    const [authRefresh, setAuthRefresh] = useState(0)
    const [showSplash, setShowSplash] = useState(true)
    const [showTemplatesBrowser, setShowTemplatesBrowser] = useState(false)
    const [showNotificationsCenter, setShowNotificationsCenter] = useState(false)
    
    // Refs for scrolling
    const goalRefs = useRef<{ [key: string]: HTMLElement | null }>({})

    // Initialize notifications system
    useEffect(() => {
        if (!user) return

        // Request notification permission on first load
        const prefs = NotificationsService.getPreferences()
        if (prefs.enabled && !NotificationsService.isSupported()) {
            NotificationsService.requestPermission()
        }

        // Start notification checker
        const cleanup = NotificationsService.startNotificationChecker()

        return cleanup
    }, [user])

    // Schedule notifications for goals with deadlines
    useEffect(() => {
        if (!user || goals.length === 0) return

        goals.forEach(goal => {
            if (goal.deadline) {
                NotificationsService.scheduleDeadlineNotifications(goal)
            }
        })
    }, [user, goals])

    // Callback to refresh app after successful authentication
    const handleAuthSuccess = () => {
        setAuthRefresh(prev => prev + 1)
    }

    // Load goals and set up real-time subscription
    useEffect(() => {
        if (!user) {
            setIsLoadingGoals(false)
            return
        }

        let subscription: any = null

        const loadGoals = async () => {
            try {
                setIsLoadingGoals(true)
                const goalsData = await GoalsService.getGoals(user.id)
                
                if (goalsData.length === 0) {
                    // Create default goals if none exist
                    await GoalsService.createDefaultGoals(user.id)
                    const defaultGoals = await GoalsService.getGoals(user.id)
                    setGoals(defaultGoals)
                } else {
                    setGoals(goalsData)
                }
            } catch (error) {
                console.error('Error loading goals:', error)
            } finally {
                setIsLoadingGoals(false)
            }
        }

        const setupRealtimeSubscription = () => {
            subscription = GoalsService.subscribeToChanges(user.id, (updatedGoals) => {
                setGoals(updatedGoals)
            })
        }

        loadGoals().then(() => {
            setupRealtimeSubscription()
        })

        return () => {
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [user, authRefresh])

    // Derived state for today's tasks
    const todayTasks = useMemo(() => {
        const today = getTodayDateString()
        const tasks: (Task & { goalId: string; goalTitle: string })[] = []
        goals.forEach(goal => {
            goal.tasks.forEach(task => {
                if (task.dueDate === today) {
                    tasks.push({ ...task, goalId: goal.id, goalTitle: goal.title })
                }
            })
        })
        return tasks
    }, [goals])

    // Event Handlers (CRUD)
    const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
        if (!user) return

        try {
            if (modal.type === 'editGoal' && modal.data.id) {
                // Update existing goal - optimistically update UI
                setGoals(prevGoals => prevGoals.map(g => 
                    g.id === modal.data.id ? { ...g, ...goalData } : g
                ))
                await GoalsService.updateGoal(modal.data.id, goalData)
            } else {
                // Add new goal
                const newGoal = await GoalsService.createGoal(user.id, goalData)
                // Optimistically add to UI
                setGoals(prevGoals => [newGoal, ...prevGoals])
            }
            setModal({ type: null, data: {} })
        } catch (error) {
            console.error('Error saving goal:', error)
            // Refetch on error
            const goalsData = await GoalsService.getGoals(user.id)
            setGoals(goalsData)
        }
    }

    const handleSelectTemplate = async (template: GoalTemplate) => {
        // Close templates browser
        setShowTemplatesBrowser(false)
        
        // Pre-fill goal modal with template data
        setModal({
            type: 'addGoal',
            data: {
                templateData: {
                    title: template.title,
                    description: template.description,
                    icon: template.icon,
                    color: template.color,
                    category: template.category,
                    tasks: template.default_tasks || []
                }
            }
        })
    }

    const handleSaveTask = async (taskData: Partial<Task>) => {
        if (!user || !modal.data.goalId) return

        const goal = goals.find(g => g.id === modal.data.goalId)
        if (!goal) return

        try {
            let newTasks: Task[]
            
            if (modal.type === 'editTask' && modal.data.taskId) {
                // Update existing task
                newTasks = goal.tasks.map(t => 
                    String(t.id) === String(modal.data.taskId) ? { ...t, ...taskData } : t
                )
            } else {
                // Add new task
                const newTask: Task = { 
                    id: String(Date.now()), 
                    text: taskData.text || '',
                    dueDate: taskData.dueDate || taskData.due_date || getTodayDateString(),
                    isComplete: false,
                    is_complete: false,
                    ...taskData
                }
                newTasks = [...goal.tasks, newTask]
            }
            
            // Optimistically update UI
            setGoals(prevGoals => prevGoals.map(g => 
                g.id === modal.data.goalId ? { ...g, tasks: newTasks } : g
            ))
            
            await GoalsService.updateTasks(modal.data.goalId, newTasks, user.id)
            setModal({ type: null, data: {} })
        } catch (error) {
            console.error('Error saving task:', error)
            // Refetch on error
            const goalsData = await GoalsService.getGoals(user.id)
            setGoals(goalsData)
        }
    }
    
    const handleToggleTask = async (goalId: string, taskId: string | number) => {
        if (!user) return
        
        const goal = goals.find(g => g.id === goalId)
        if (!goal) return

        try {
            const newTasks = goal.tasks.map(t =>
                String(t.id) === String(taskId) ? { ...t, isComplete: !t.isComplete, is_complete: !t.isComplete } : t
            )
            
            // Optimistically update UI immediately
            setGoals(prevGoals => prevGoals.map(g => 
                g.id === goalId ? { ...g, tasks: newTasks } : g
            ))
            
            // Then update the database
            await GoalsService.updateTasks(goalId, newTasks, user.id)
        } catch (error) {
            console.error('Error toggling task:', error)
            // Revert optimistic update on error by refetching
            const goalsData = await GoalsService.getGoals(user.id)
            setGoals(goalsData)
        }
    }

    const handleDelete = async () => {
        if (!user) return
        
        const { type, data } = modal
        try {
            if (type === 'delete' && data.goalId && !data.taskId) {
                // Delete Goal - optimistically remove from UI
                setGoals(prevGoals => prevGoals.filter(g => g.id !== data.goalId))
                await GoalsService.deleteGoal(data.goalId)
                
            } else if (type === 'delete' && data.goalId && data.taskId) {
                // Delete Task
                const goal = goals.find(g => g.id === data.goalId)
                if (!goal) return
                
                const newTasks = goal.tasks.filter(t => String(t.id) !== String(data.taskId))
                
                // Optimistically update UI
                setGoals(prevGoals => prevGoals.map(g => 
                    g.id === data.goalId ? { ...g, tasks: newTasks } : g
                ))
                
                await GoalsService.updateTasks(data.goalId, newTasks, user.id)
            }
            setModal({ type: null, data: {} })
        } catch (error) {
            console.error('Error deleting:', error)
            // Refetch on error
            const goalsData = await GoalsService.getGoals(user.id)
            setGoals(goalsData)
        }
    }

    // Navigation Handlers
    const handleViewGoalDetails = (goalId: string) => {
        setCurrentPage('goals')
        setHighlightGoalId(goalId)
        
        setTimeout(() => {
            const el = goalRefs.current[goalId]
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 100)
        
        setTimeout(() => setHighlightGoalId(null), 2000)
    }
    
    // Render Logic
    const renderPage = () => {
        if (isLoadingGoals) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading goals...</div>
                </div>
            )
        }

        switch (currentPage) {
            case 'diary':
                return (
                    <DiaryScreen 
                        goals={goals} 
                        todayTasks={todayTasks} 
                        onViewGoal={handleViewGoalDetails}
                        onToggleTask={handleToggleTask}
                        onNavigate={setCurrentPage}
                    />
                )
            case 'goals':
                return (
                    <GoalsScreen 
                        goals={goals}
                        goalRefs={goalRefs}
                        highlightGoalId={highlightGoalId}
                        onSetModal={setModal}
                        onToggleTask={handleToggleTask}
                        userId={user.id}
                    />
                )
            case 'habits':
                return <HabitsScreenEnhanced userId={user.id} />
            case 'calendar':
                return <CalendarScreen goals={goals} />
            case 'statistics':
                return <StatisticsScreen goals={goals} onNavigate={setCurrentPage} />
            case 'profile':
                return <UserProfileScreen goals={goals} onNavigate={setCurrentPage} />
            case 'subscription':
                return <SubscriptionPlansScreen />
            default:
                return (
                    <DiaryScreen 
                        goals={goals} 
                        todayTasks={todayTasks} 
                        onViewGoal={handleViewGoalDetails}
                        onToggleTask={handleToggleTask}
                        onNavigate={setCurrentPage}
                    />
                )
        }
    }

    // Find goal/task for modals
    const editingGoal = modal.type === 'editGoal' && modal.data.id ? 
        goals.find(g => g.id === modal.data.id) : null
    const editingTaskGoal = modal.type === 'editTask' && modal.data.goalId ? 
        goals.find(g => g.id === modal.data.goalId) : null
    const editingTask = editingTaskGoal && modal.data.taskId ? 
        editingTaskGoal.tasks.find(t => String(t.id) === String(modal.data.taskId)) : null
    
    let deleteMessage = ""
    if (modal.type === 'delete') {
        if (modal.data.taskId && modal.data.goalId) {
            const goal = goals.find(g => g.id === modal.data.goalId)
            const task = goal ? goal.tasks.find(t => String(t.id) === String(modal.data.taskId)) : null
            deleteMessage = `Are you sure you want to delete the task: "${task?.text}"? This cannot be undone.`
        } else if (modal.data.goalId) {
            const goal = goals.find(g => g.id === modal.data.goalId)
            deleteMessage = `Are you sure you want to delete the goal: "${goal?.title}"? All its tasks will also be deleted.`
        }
    }

    if (loading || showSplash) {
        return (
            <>
                {showSplash && (
                    <SplashScreen onComplete={() => setShowSplash(false)} />
                )}
                {!showSplash && loading && (
                    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen flex items-center justify-center">
                        <div className="text-gray-500 dark:text-gray-400">Initializing...</div>
                    </div>
                )}
            </>
        )
    }

    if (!user) {
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />
    }

    const getInitials = (email: string) => {
        const name = email.split('@')[0]
        const parts = name.split(/[._-]/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const getGradientFromEmail = (email: string) => {
        const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const gradients = [
            'from-blue-500 to-purple-600',
            'from-purple-500 to-pink-600',
            'from-green-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-indigo-500 to-blue-600',
            'from-pink-500 to-rose-600'
        ]
        return gradients[hash % gradients.length]
    }

    const handleFabClick = () => {
        // Context-aware FAB based on current page
        if (currentPage === 'habits') {
            // For habits page, the HabitsScreenEnhanced handles its own add button
            // FAB should not interfere
            return;
        } else if (currentPage === 'goals') {
            setModal({ type: 'addGoal', data: {} })
        } else {
            // Default to adding a goal for other pages
            setModal({ type: 'addGoal', data: {} })
        }
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Top-Right Controls */}
            <div className="fixed top-0 left-0 right-0 max-w-lg mx-auto h-11 z-20 flex items-center justify-end px-4 gap-2">
                {/* Notifications Button */}
                <button
                    onClick={() => setShowNotificationsCenter(true)}
                    className="w-8 h-8 rounded-full glass-tertiary flex items-center justify-center shadow-sm hover:scale-105 transition-all active:scale-95"
                    aria-label="Notifications"
                >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                
                {/* Profile Button */}
                <button
                    onClick={() => setCurrentPage('profile')}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradientFromEmail(user?.email || '')} flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-all active:scale-95 ring-1 ring-white/20`}
                    aria-label="Profile"
                >
                    {getInitials(user?.email || 'User')}
                </button>
            </div>
            
            <main className="pb-24 pt-11 max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-lg min-h-screen">
                {renderPage()}
            </main>
            <NavBar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                onFabClick={handleFabClick}
                userId={user?.id}
            />
            
            {/* Modals */}
            {(modal.type === 'addGoal' || modal.type === 'editGoal') && (
                <GoalModal
                    isOpen={true}
                    onClose={() => setModal({ type: null, data: {} })}
                    onSave={handleSaveGoal}
                    initialData={editingGoal}
                    templateData={modal.data.templateData}
                    onBrowseTemplates={() => {
                        setModal({ type: null, data: {} })
                        setShowTemplatesBrowser(true)
                    }}
                />
            )}
            
            {(modal.type === 'addTask' || modal.type === 'editTask') && (
                <TaskModalEnhanced
                    isOpen={true}
                    onClose={() => setModal({ type: null, data: {} })}
                    onSave={handleSaveTask}
                    initialData={editingTask}
                    goalId={modal.data.goalId}
                />
            )}

            {modal.type === 'delete' && (
                <DeleteModal
                    isOpen={true}
                    onClose={() => setModal({ type: null, data: {} })}
                    onConfirm={handleDelete}
                    title={modal.data.taskId ? "Delete Task?" : "Delete Goal?"}
                    message={deleteMessage}
                />
            )}

            {/* Templates Browser */}
            <GoalTemplatesBrowser
                isOpen={showTemplatesBrowser}
                onClose={() => setShowTemplatesBrowser(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            {/* Notifications Center */}
            <NotificationsCenter
                isOpen={showNotificationsCenter}
                onClose={() => setShowNotificationsCenter(false)}
            />
        </div>
    )
}

function App() {
    console.log('[App] Rendering App component')
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App