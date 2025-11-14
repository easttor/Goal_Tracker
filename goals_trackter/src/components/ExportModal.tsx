import React, { useState } from 'react'
import { Download, FileText, Table, Activity, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { ExportService } from '../lib/exportService'
import { Goal } from '../types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  userId: string
  userEmail: string
}

type ExportFormat = 'pdf' | 'goals-csv' | 'tasks-csv' | 'activity-csv'

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  goals,
  userId,
  userEmail
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const exportFormats = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF Report',
      description: 'Complete report with goals, tasks, and statistics',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      id: 'goals-csv' as ExportFormat,
      name: 'Goals CSV',
      description: 'Goals data in spreadsheet format',
      icon: Table,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'tasks-csv' as ExportFormat,
      name: 'Tasks CSV',
      description: 'All tasks data in spreadsheet format',
      icon: Table,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'activity-csv' as ExportFormat,
      name: 'Activity CSV',
      description: 'Your activity history and statistics',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ]

  const handleExport = async () => {
    try {
      setExporting(true)
      setExportStatus({ type: null, message: '' })

      switch (selectedFormat) {
        case 'pdf':
          await ExportService.exportToPDF(userId, goals, userEmail)
          setExportStatus({
            type: 'success',
            message: 'PDF report generated successfully!'
          })
          break
        case 'goals-csv':
          ExportService.exportGoalsToCSV(goals)
          setExportStatus({
            type: 'success',
            message: 'Goals CSV exported successfully!'
          })
          break
        case 'tasks-csv':
          ExportService.exportTasksToCSV(goals)
          setExportStatus({
            type: 'success',
            message: 'Tasks CSV exported successfully!'
          })
          break
        case 'activity-csv':
          await ExportService.exportActivityToCSV(userId)
          setExportStatus({
            type: 'success',
            message: 'Activity CSV exported successfully!'
          })
          break
      }

      // Auto-close after successful export
      setTimeout(() => {
        onClose()
        setExportStatus({ type: null, message: '' })
      }, 2000)
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        type: 'error',
        message: 'Failed to export data. Please try again.'
      })
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Export Data
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Download your goals and progress
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={exporting}
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {exportFormats.map(format => {
              const Icon = format.icon
              const isSelected = selectedFormat === format.id

              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  disabled={exporting}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${format.borderColor} ${format.bgColor}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${exporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${format.bgColor}`}>
                      <Icon className={`w-6 h-6 ${format.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {format.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {format.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="bg-blue-600 rounded-full p-1">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Export Status */}
          {exportStatus.type && (
            <div
              className={`mt-4 p-4 rounded-lg border-2 flex items-start gap-3 ${
                exportStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              {exportStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-medium ${
                  exportStatus.type === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                }`}
              >
                {exportStatus.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={exporting}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || exportStatus.type === 'success'}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {exportFormats.find(f => f.id === selectedFormat)?.name}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
