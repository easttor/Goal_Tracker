import React, { useState, useEffect } from 'react'
import { Download, Save, Check, Crown, Sparkles } from 'lucide-react'
import { Goal, Task } from '../types'
import { iconMap, getColorClasses } from '../lib/constants'
import { calculateProgress } from '../lib/utils'
import { useAuth } from '../lib/auth'
import { subscriptionService } from '../lib/subscriptionService'
import ProUpgradeBanner from './ProUpgradeBanner'

interface DiaryScreenProps {
  goals: Goal[]
  todayTasks: (Task & { goalId: string; goalTitle: string })[]
  onViewGoal: (goalId: string) => void
  onToggleTask: (goalId: string, taskId: string | number) => void
  onNavigate?: (page: string) => void
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ 
  goals, 
  todayTasks, 
  onViewGoal, 
  onToggleTask,
  onNavigate
}) => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      try {
        const subscription = await subscriptionService.getUserSubscription(user.id);
        setIsPro(subscription?.status === 'active' && subscription?.plan?.name === 'Pro');
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSubscription();
  }, [user]);
  return (
    <div id="diaryScreen" className="fade-in relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/diary_background_5.jpg)',
          filter: 'brightness(0.3)'
        }}
      />
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm -z-10" />
      
      <header className="p-4 pt-6 relative">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Daily Report</h1>
        <p className="text-gray-500 font-medium">
          {new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
        <button className="absolute top-6 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95">
          <Download className="w-4 h-4 mr-1.5" />
          Export
        </button>
      </header>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Goals Overview</h2>
        <div id="goalsOverviewContainer" className="grid grid-cols-2 gap-4">
          {goals.map(goal => (
            <GoalOverviewCard 
              key={goal.id} 
              goal={goal} 
              onViewGoal={onViewGoal} 
            />
          ))}
        </div>
      </section>

      {/* Pro Upgrade Banner for Free Users */}
      {!loading && !isPro && (
        <section className="p-4">
          <ProUpgradeBanner 
            onUpgrade={() => onNavigate?.('subscription')}
            message="Track unlimited goals and habits with advanced analytics"
          />
        </section>
      )}

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Tasks</h2>
        <div id="todayTasksContainer" className="bg-white rounded-2xl space-y-4 p-5 shadow-lg border-2 border-gray-100">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center ${task.isComplete ? 'opacity-60' : ''} cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200`} 
                onClick={() => onToggleTask(task.goalId, task.id)}
              >
                <div className={`w-7 h-7 ${
                  task.isComplete 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white shadow-md' 
                    : 'border-2 border-gray-300 hover:border-blue-400'
                } rounded-full flex-shrink-0 mr-4 flex items-center justify-center transition-all duration-200 hover:scale-110`}>
                  {task.isComplete && <Check className="w-4 h-4 checkmark-animate" />}
                </div>
                <div className="flex-grow">
                  <p className={`font-semibold ${task.isComplete ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.text}
                  </p>
                  <p className={`text-sm ${task.isComplete ? 'line-through text-gray-400' : 'text-gray-500'} font-medium`}>
                    From: {task.goalTitle}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4 font-medium">No tasks due today. Great job!</p>
          )}
        </div>
      </section>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Daily Entry</h2>
        <textarea 
          className="w-full h-32 border-2 border-gray-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm" 
          placeholder="Write about your day..."
        />
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl mt-3 flex items-center justify-center text-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transition-all duration-200 active:scale-95">
          <Save className="w-5 h-5 mr-2" />
          Save Entry
        </button>
      </section>
    </div>
  )
}

interface GoalOverviewCardProps {
  goal: Goal
  onViewGoal: (goalId: string) => void
}

const GoalOverviewCard: React.FC<GoalOverviewCardProps> = ({ goal, onViewGoal }) => {
  const totalTasks = goal.tasks.length
  const completedTasks = goal.tasks.filter(t => t.isComplete).length
  const progress = calculateProgress(completedTasks, totalTasks)
  const IconComponent = iconMap[goal.icon as keyof typeof iconMap] || iconMap.Target
  const colors = getColorClasses(goal.color)
  
  return (
    <div 
      className={`bg-gradient-to-br ${colors.bgLight} ${colors.bgMedium} p-4 rounded-2xl shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${colors.border} border-2`}
      onClick={() => onViewGoal(goal.id)}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-gray-800 truncate text-sm">{goal.title}</span>
        <span className={`${colors.icon} p-2 rounded-xl text-white shadow-md transition-transform duration-200 hover:scale-110`}>
          <IconComponent className="w-4 h-4" />
        </span>
      </div>
      <div className="w-full bg-white/70 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div 
          className={`${colors.progressFill} h-2.5 rounded-full transition-all duration-600 ease-out`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right text-sm font-bold text-gray-700 mt-2">{progress}% complete</p>
    </div>
  )
}

export default DiaryScreen