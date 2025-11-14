import React, { useState } from 'react'
import { Task, Priority } from '../types'
import { getTodayDateString } from '../lib/utils'
import { AlertCircle, Clock, Repeat, Calendar } from 'lucide-react'
import { RecurringTasksService, RecurringPattern } from '../lib/recurringTasksService'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Partial<Task>) => void
  initialData?: Task | null
  goalId?: string
}

const priorityOptions: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: 'high', label: 'High Priority', color: 'red', icon: '🔥' },
  { value: 'medium', label: 'Medium Priority', color: 'yellow', icon: '⚡' },
  { value: 'low', label: 'Low Priority', color: 'green', icon: '📋' }
]

const categoryOptions = [
  'Work', 'Personal', 'Health', 'Education', 'Finance', 'Home', 'Social', 'Other'
]

const TaskModalEnhanced: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  // Get existing recurring pattern if any
  const existingPattern = initialData ? RecurringTasksService.getPattern(initialData) : null
  
  const [formData, setFormData] = useState({ 
    text: initialData?.text || '',
    description: initialData?.description || '',
    dueDate: initialData?.due_date || initialData?.dueDate || getTodayDateString(),
    priority: (initialData?.priority as Priority) || 'medium',
    category: initialData?.category || '',
    estimatedMinutes: initialData?.estimated_minutes || undefined
  })
  
  const [isRecurring, setIsRecurring] = useState(!!existingPattern)
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>(
    existingPattern || {
      frequency: 'daily',
      interval: 1
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData: any = {
      text: formData.text,
      description: formData.description,
      due_date: formData.dueDate,
      dueDate: formData.dueDate, // For backward compatibility
      priority: formData.priority,
      category: formData.category || undefined,
      estimated_minutes: formData.estimatedMinutes ? parseInt(String(formData.estimatedMinutes)) : undefined
    }
    
    // Add recurring pattern if enabled
    if (isRecurring && RecurringTasksService.validatePattern(recurringPattern)) {
      taskData.recurring_pattern = JSON.stringify(recurringPattern)
    }
    
    onSave(taskData)
  }
  
  const handleRecurringPatternChange = (field: keyof RecurringPattern, value: any) => {
    setRecurringPattern(prev => ({ ...prev, [field]: value }))
  }
  
  const toggleDayOfWeek = (day: number) => {
    setRecurringPattern(prev => {
      const currentDays = prev.daysOfWeek || []
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort()
      return { ...prev, daysOfWeek: newDays }
    })
  }

  if (!isOpen) return null

  const selectedPriority = priorityOptions.find(p => p.value === formData.priority)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {initialData ? 'Edit Task' : 'Add New Task'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task Title */}
            <div className="fade-in">
              <label htmlFor="text" className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title
              </label>
              <input 
                type="text" 
                id="text" 
                name="text" 
                value={formData.text} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                placeholder="e.g., Complete project report" 
                required 
              />
            </div>

            {/* Description */}
            <div className="fade-in">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none" 
                placeholder="Add more details about this task..."
                rows={3}
              />
            </div>
            
            {/* Priority Selector */}
            <div className="fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.priority === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 shadow-md scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className={`text-xs font-semibold ${
                      formData.priority === option.value ? `text-${option.color}-700` : 'text-gray-600'
                    }`}>
                      {option.label.replace(' Priority', '')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="fade-in">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
              >
                <option value="">No category</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Due Date and Time Estimate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="fade-in">
                <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date
                </label>
                <input 
                  type="date" 
                  id="dueDate" 
                  name="dueDate" 
                  value={formData.dueDate} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer" 
                />
              </div>

              <div className="fade-in">
                <label htmlFor="estimatedMinutes" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Time (mins)
                </label>
                <input 
                  type="number" 
                  id="estimatedMinutes" 
                  name="estimatedMinutes" 
                  value={formData.estimatedMinutes || ''} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  placeholder="30"
                  min="0"
                />
              </div>
            </div>

            {/* Recurring Task Section */}
            <div className="fade-in border-t-2 border-gray-100 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <Repeat className="w-4 h-4 mr-2 text-purple-600" />
                  Make this task recurring
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isRecurring ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isRecurring ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isRecurring && (
                <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
                  {/* Frequency Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Repeat Frequency
                    </label>
                    <select
                      value={recurringPattern.frequency}
                      onChange={(e) => handleRecurringPatternChange('frequency', e.target.value)}
                      className="w-full border-2 border-purple-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Interval Input (for all types) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Repeat every
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={recurringPattern.interval}
                        onChange={(e) => handleRecurringPatternChange('interval', parseInt(e.target.value))}
                        className="w-20 border-2 border-purple-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <span className="text-sm text-gray-600">
                        {recurringPattern.frequency === 'daily' && 'day(s)'}
                        {recurringPattern.frequency === 'weekly' && 'week(s)'}
                        {recurringPattern.frequency === 'monthly' && 'month(s)'}
                        {recurringPattern.frequency === 'yearly' && 'year(s)'}
                        {recurringPattern.frequency === 'custom' && 'day(s)'}
                      </span>
                    </div>
                  </div>

                  {/* Weekly - Days of Week Selector */}
                  {recurringPattern.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                          const isSelected = recurringPattern.daysOfWeek?.includes(index) || false
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => toggleDayOfWeek(index)}
                              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white border-2 border-purple-200 text-gray-600 hover:border-purple-400'
                              }`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Monthly - Day of Month */}
                  {recurringPattern.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Day of month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={recurringPattern.dayOfMonth || 1}
                        onChange={(e) => handleRecurringPatternChange('dayOfMonth', parseInt(e.target.value))}
                        className="w-full border-2 border-purple-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={recurringPattern.skipWeekends || false}
                        onChange={(e) => handleRecurringPatternChange('skipWeekends', e.target.checked)}
                        className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                      />
                      Skip weekends
                    </label>
                  </div>

                  {/* End Date (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End date (optional)
                    </label>
                    <input
                      type="date"
                      value={recurringPattern.endDate || ''}
                      onChange={(e) => handleRecurringPatternChange('endDate', e.target.value || undefined)}
                      className="w-full border-2 border-purple-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Pattern Description */}
                  <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Pattern: </span>
                        {RecurringTasksService.getPatternDescription(recurringPattern)}
                        {recurringPattern.endDate && (
                          <span> until {new Date(recurringPattern.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t-2 border-gray-100">
              <button 
                type="button" 
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 active:scale-95" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                {initialData ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TaskModalEnhanced
