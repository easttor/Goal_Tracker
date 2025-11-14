import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed pl-16">{message}</p>
          
          <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-100">
            <button 
              type="button" 
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 active:scale-95" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal