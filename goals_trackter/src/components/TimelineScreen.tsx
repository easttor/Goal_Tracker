import React, { useMemo } from 'react'
import { Bell, Award, Flame, CheckCircle, BookMarked } from 'lucide-react'
import { Goal } from '../types'

interface TimelineScreenProps {
  goals: Goal[]
}

interface Achievement {
  id: string
  type: 'goal_completed' | 'task_completed' | 'streak' | 'milestone'
  title: string
  description: string
  timestamp: string
  icon: 'Award' | 'CheckCircle' | 'Flame' | 'BookMarked'
  color: string
}

const TimelineScreen: React.FC<TimelineScreenProps> = ({ goals }) => {
  // Generate achievements from goals data
  const achievements = useMemo(() => {
    const items: Achievement[] = []
    
    // Add completed goals
    goals.forEach(goal => {
      const completedTasks = goal.tasks.filter(t => t.isComplete).length
      const totalTasks = goal.tasks.length
      
      if (totalTasks > 0 && completedTasks === totalTasks) {
        items.push({
          id: `goal-${goal.id}`,
          type: 'goal_completed',
          title: `Completed Goal: ${goal.title}`,
          description: `Finished all ${totalTasks} tasks`,
          timestamp: new Date().toISOString(),
          icon: 'Award',
          color: 'yellow'
        })
      }
      
      // Add recent completed tasks
      goal.tasks.forEach(task => {
        if (task.isComplete) {
          items.push({
            id: `task-${goal.id}-${task.id}`,
            type: 'task_completed',
            title: `Finished Task: ${task.text}`,
            description: `From goal: ${goal.title}`,
            timestamp: new Date().toISOString(),
            icon: 'CheckCircle',
            color: 'blue'
          })
        }
      })
    })
    
    // Add some example achievements
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Add streak achievement
    if (items.length > 0) {
      items.push({
        id: 'streak-1',
        type: 'streak',
        title: 'Achieved a 7-day task completion streak!',
        description: 'Keep up the great work!',
        timestamp: yesterday.toISOString(),
        icon: 'Flame',
        color: 'red'
      })
    }
    
    // Add milestone achievement
    if (goals.length >= 2) {
      items.push({
        id: 'milestone-1',
        type: 'milestone',
        title: 'Created your first goals',
        description: `You've set up ${goals.length} goals to track`,
        timestamp: yesterday.toISOString(),
        icon: 'BookMarked',
        color: 'green'
      })
    }
    
    // Sort by timestamp (most recent first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [goals])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return Award
      case 'CheckCircle':
        return CheckCircle
      case 'Flame':
        return Flame
      case 'BookMarked':
        return BookMarked
      default:
        return CheckCircle
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600'
      case 'blue':
        return 'bg-blue-100 text-blue-600'
      case 'red':
        return 'bg-red-100 text-red-600'
      case 'green':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays === 0) {
      if (diffHours === 0) {
        return 'Just now'
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div id="timelineScreen">
      <header className="p-4 pt-6 flex justify-between items-center relative">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <Bell className="text-gray-700 w-6 h-6" />
      </header>
      
      <section className="p-4">
        <h2 className="text-xl font-semibold mb-3">Recent Achievements</h2>
        {achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map(achievement => {
              const IconComponent = getIconComponent(achievement.icon)
              const colorClasses = getColorClasses(achievement.color)
              
              return (
                <div key={achievement.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${colorClasses} flex items-center justify-center mr-4 flex-shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(achievement.timestamp)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No achievements yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Complete some tasks to see your achievements here!
            </p>
          </div>
        )}
      </section>

      {/* Stats summary */}
      <section className="p-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
              <p className="text-xs text-gray-500">Active Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {goals.reduce((sum, goal) => sum + goal.tasks.filter(t => t.isComplete).length, 0)}
              </p>
              <p className="text-xs text-gray-500">Tasks Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {achievements.filter(a => a.type === 'streak').length || 1}
              </p>
              <p className="text-xs text-gray-500">Current Streak</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TimelineScreen