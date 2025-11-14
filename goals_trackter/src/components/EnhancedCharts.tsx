import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Goal, Task } from '../types'
import { UserActivity } from '../lib/userActivityService'

interface EnhancedChartsProps {
  goals: Goal[]
  recentActivity: UserActivity[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({ goals, recentActivity }) => {
  
  // 1. Goal Completion Trend (Last 30 days)
  const completionTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    return last30Days.map(date => {
      const activity = recentActivity.find(a => a.activity_date === date)
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        goals: activity?.goals_completed_count || 0,
        tasks: activity?.tasks_completed_count || 0,
        habits: activity?.habits_completed_count || 0
      }
    })
  }, [recentActivity])

  // 2. Task Priority Distribution
  const priorityDistribution = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 }
    goals.forEach(goal => {
      goal.tasks.forEach((task: Task) => {
        const priority = task.priority || 'medium'
        counts[priority as keyof typeof counts]++
      })
    })
    return [
      { name: 'High Priority', value: counts.high, color: '#ef4444' },
      { name: 'Medium Priority', value: counts.medium, color: '#f59e0b' },
      { name: 'Low Priority', value: counts.low, color: '#10b981' }
    ]
  }, [goals])

  // 3. Weekly Productivity Heatmap Data
  const weeklyProductivity = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const activity = recentActivity.find(a => a.activity_date === dateStr)
      const total = (activity?.goals_completed_count || 0) + 
                    (activity?.tasks_completed_count || 0) + 
                    (activity?.habits_completed_count || 0)
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        productivity: total,
        fullDate: dateStr
      }
    })
  }, [recentActivity])

  // 4. Goal Category Distribution
  const categoryDistribution = useMemo(() => {
    const categories: { [key: string]: number } = {}
    goals.forEach(goal => {
      const category = goal.category || 'Personal'
      categories[category] = (categories[category] || 0) + 1
    })
    
    return Object.entries(categories).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length]
    }))
  }, [goals])

  // 5. Task Completion Rate Over Time
  const taskCompletionRate = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i))
      return date.toISOString().split('T')[0]
    })

    return last14Days.map(date => {
      const activity = recentActivity.find(a => a.activity_date === date)
      const tasksCompleted = activity?.tasks_completed_count || 0
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: tasksCompleted,
        target: 5 // Could be dynamic based on user goals
      }
    })
  }, [recentActivity])

  return (
    <div className="space-y-6">
      {/* 1. Completion Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Completion Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={completionTrendData}>
            <defs>
              <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="goals" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorGoals)"
              name="Goals"
            />
            <Area 
              type="monotone" 
              dataKey="tasks" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorTasks)"
              name="Tasks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Weekly Productivity Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Weekly Productivity
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyProductivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="productivity" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Total Completions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Task Priority Distribution & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Task Priorities
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Goal Categories
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Task Completion Rate */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Task Completion Rate (Last 14 Days)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={taskCompletionRate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#94a3b8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#94a3b8', r: 4 }}
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EnhancedCharts
