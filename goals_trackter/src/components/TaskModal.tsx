import React, { useState, useEffect } from 'react'
import { Task } from '../types'
import { getTodayDateString } from '../lib/utils'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: { text: string; dueDate: string }) => void
  initialData?: Task | null
  goalId?: string
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({ 
    text: '', 
    dueDate: getTodayDateString() 
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text || '',
        dueDate: initialData.dueDate || getTodayDateString(),
      })
    } else {
      setFormData({
        text: '',
        dueDate: getTodayDateString(),
      })
    }
  }, [initialData])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {initialData ? 'Edit Task' : 'Add New Task'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="fade-in">
              <label htmlFor="text" className="block text-sm font-semibold text-gray-700 mb-2">
                Task Description
              </label>
              <input 
                type="text" 
                id="text" 
                name="text" 
                value={formData.text} 
                onChange={handleChange} 
                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                placeholder="e.g., Run 3 miles" 
                required 
              />
            </div>
            
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

export default TaskModal