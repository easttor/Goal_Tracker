import React, { useState, useEffect } from 'react'
import { X, Bell, BellOff, Clock, Calendar, Award } from 'lucide-react'
import { NotificationsService, NotificationPreferences } from '../lib/notificationsService'

interface NotificationsCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    NotificationsService.getPreferences()
  )
  const [permissionGranted, setPermissionGranted] = useState(
    NotificationsService.isSupported()
  )

  useEffect(() => {
    setPermissionGranted(NotificationsService.isSupported())
  }, [])

  const handleRequestPermission = async () => {
    const granted = await NotificationsService.requestPermission()
    setPermissionGranted(granted)
    
    if (granted) {
      NotificationsService.showNotification('Notifications Enabled', {
        body: 'You will now receive important reminders and updates',
      })
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    NotificationsService.savePreferences(newPreferences)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Permission Request */}
          {!permissionGranted && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BellOff className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Notifications Disabled
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Enable browser notifications to receive important reminders about deadlines, habits, and achievements.
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                All Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Master control for all notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => handlePreferenceChange('enabled', e.target.checked)}
                className="sr-only peer"
                disabled={!permissionGranted}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Deadline Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Deadline Reminders
              </h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  1 week before deadline
                </span>
                <input
                  type="checkbox"
                  checked={preferences.deadline1WeekBefore}
                  onChange={(e) => handlePreferenceChange('deadline1WeekBefore', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  3 days before deadline
                </span>
                <input
                  type="checkbox"
                  checked={preferences.deadline3DaysBefore}
                  onChange={(e) => handlePreferenceChange('deadline3DaysBefore', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  1 day before deadline
                </span>
                <input
                  type="checkbox"
                  checked={preferences.deadline1DayBefore}
                  onChange={(e) => handlePreferenceChange('deadline1DayBefore', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>
          </div>

          {/* Habit Reminders */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Daily Habit Reminders
              </h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable habit reminders
                </span>
                <input
                  type="checkbox"
                  checked={preferences.habitRemindersEnabled}
                  onChange={(e) => handlePreferenceChange('habitRemindersEnabled', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              {preferences.habitRemindersEnabled && (
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 block mb-2">
                    Reminder time
                  </label>
                  <input
                    type="time"
                    value={preferences.habitReminderTime}
                    onChange={(e) => handlePreferenceChange('habitReminderTime', e.target.value)}
                    disabled={!preferences.enabled || !permissionGranted}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Weekly Reports */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Progress Reports
              </h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Weekly progress summary
                </span>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReportEnabled}
                  onChange={(e) => handlePreferenceChange('weeklyReportEnabled', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Achievement notifications
                </span>
                <input
                  type="checkbox"
                  checked={preferences.achievementNotifications}
                  onChange={(e) => handlePreferenceChange('achievementNotifications', e.target.checked)}
                  disabled={!preferences.enabled || !permissionGranted}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCenter
