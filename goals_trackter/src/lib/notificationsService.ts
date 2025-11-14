import { Goal, Task, Habit } from '../types'

export interface NotificationPreferences {
  enabled: boolean
  deadlineNotifications: boolean
  deadline1DayBefore: boolean
  deadline3DaysBefore: boolean
  deadline1WeekBefore: boolean
  habitRemindersEnabled: boolean
  habitReminderTime: string // HH:MM format
  weeklyReportEnabled: boolean
  weeklyReportDay: number // 1=Monday
  achievementNotifications: boolean
}

export interface ScheduledNotification {
  id: string
  type: 'deadline' | 'habit' | 'achievement' | 'weekly_report'
  title: string
  body: string
  scheduledTime: Date
  data?: any
}

export class NotificationsService {
  private static STORAGE_KEY = 'notification_preferences'
  private static SCHEDULED_KEY = 'scheduled_notifications'
  
  // Default preferences
  private static DEFAULT_PREFERENCES: NotificationPreferences = {
    enabled: true,
    deadlineNotifications: true,
    deadline1DayBefore: true,
    deadline3DaysBefore: true,
    deadline1WeekBefore: true,
    habitRemindersEnabled: true,
    habitReminderTime: '09:00',
    weeklyReportEnabled: true,
    weeklyReportDay: 1,
    achievementNotifications: true,
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Check if notifications are supported and permitted
  static isSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted'
  }

  // Get user preferences from local storage
  static getPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return { ...this.DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
    return this.DEFAULT_PREFERENCES
  }

  // Save user preferences to local storage
  static savePreferences(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  // Show immediate notification
  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const prefs = this.getPreferences()
    
    if (!prefs.enabled || !this.isSupported()) {
      return
    }

    try {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      })
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  // Schedule deadline notifications for a goal
  static scheduleDeadlineNotifications(goal: Goal): void {
    const prefs = this.getPreferences()
    
    if (!prefs.enabled || !prefs.deadlineNotifications || !goal.deadline) {
      return
    }

    const deadline = new Date(goal.deadline)
    const now = new Date()
    
    const notifications: ScheduledNotification[] = []

    // 1 week before
    if (prefs.deadline1WeekBefore) {
      const weekBefore = new Date(deadline)
      weekBefore.setDate(weekBefore.getDate() - 7)
      if (weekBefore > now) {
        notifications.push({
          id: `${goal.id}-week`,
          type: 'deadline',
          title: 'Deadline Approaching',
          body: `"${goal.title}" is due in 1 week`,
          scheduledTime: weekBefore,
          data: { goalId: goal.id },
        })
      }
    }

    // 3 days before
    if (prefs.deadline3DaysBefore) {
      const threeDaysBefore = new Date(deadline)
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3)
      if (threeDaysBefore > now) {
        notifications.push({
          id: `${goal.id}-3days`,
          type: 'deadline',
          title: 'Deadline Approaching',
          body: `"${goal.title}" is due in 3 days`,
          scheduledTime: threeDaysBefore,
          data: { goalId: goal.id },
        })
      }
    }

    // 1 day before
    if (prefs.deadline1DayBefore) {
      const dayBefore = new Date(deadline)
      dayBefore.setDate(dayBefore.getDate() - 1)
      if (dayBefore > now) {
        notifications.push({
          id: `${goal.id}-1day`,
          type: 'deadline',
          title: 'Deadline Tomorrow',
          body: `"${goal.title}" is due tomorrow!`,
          scheduledTime: dayBefore,
          data: { goalId: goal.id },
        })
      }
    }

    this.saveScheduledNotifications(notifications)
  }

  // Schedule daily habit reminder
  static scheduleHabitReminder(habit: Habit): void {
    const prefs = this.getPreferences()
    
    if (!prefs.enabled || !prefs.habitRemindersEnabled) {
      return
    }

    const [hours, minutes] = prefs.habitReminderTime.split(':').map(Number)
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const notification: ScheduledNotification = {
      id: `habit-${habit.id}`,
      type: 'habit',
      title: 'Time for your habit!',
      body: `Don't forget: ${habit.title}`,
      scheduledTime: reminderTime,
      data: { habitId: habit.id },
    }

    this.saveScheduledNotifications([notification])
  }

  // Show achievement notification
  static showAchievementNotification(title: string, description: string): void {
    const prefs = this.getPreferences()
    
    if (!prefs.enabled || !prefs.achievementNotifications) {
      return
    }

    this.showNotification('Achievement Unlocked!', {
      body: `${title}: ${description}`,
      tag: 'achievement',
    })
  }

  // Check and trigger scheduled notifications
  static checkScheduledNotifications(): void {
    const scheduled = this.getScheduledNotifications()
    const now = new Date()
    
    const toTrigger = scheduled.filter(n => new Date(n.scheduledTime) <= now)
    const remaining = scheduled.filter(n => new Date(n.scheduledTime) > now)

    // Trigger due notifications
    toTrigger.forEach(notification => {
      this.showNotification(notification.title, {
        body: notification.body,
        tag: notification.id,
        data: notification.data,
      })
    })

    // Save remaining notifications
    if (toTrigger.length > 0) {
      this.setScheduledNotifications(remaining)
    }
  }

  // Private helper: Get scheduled notifications from storage
  private static getScheduledNotifications(): ScheduledNotification[] {
    try {
      const stored = localStorage.getItem(this.SCHEDULED_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error)
    }
    return []
  }

  // Private helper: Save scheduled notifications to storage
  private static saveScheduledNotifications(notifications: ScheduledNotification[]): void {
    const existing = this.getScheduledNotifications()
    const combined = [...existing, ...notifications]
    
    // Remove duplicates by id
    const unique = combined.filter((n, index, self) => 
      index === self.findIndex(t => t.id === n.id)
    )
    
    this.setScheduledNotifications(unique)
  }

  // Private helper: Set scheduled notifications (replace all)
  private static setScheduledNotifications(notifications: ScheduledNotification[]): void {
    try {
      localStorage.setItem(this.SCHEDULED_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error('Error saving scheduled notifications:', error)
    }
  }

  // Initialize notification checking interval
  static startNotificationChecker(): () => void {
    // Check every minute
    const intervalId = setInterval(() => {
      this.checkScheduledNotifications()
    }, 60000)

    // Check immediately on start
    this.checkScheduledNotifications()

    // Return cleanup function
    return () => clearInterval(intervalId)
  }

  // Calculate task completion stats for weekly report
  static generateWeeklyReport(goals: Goal[]): string {
    const completedTasks = goals.reduce((sum, goal) => 
      sum + goal.tasks.filter(t => t.is_complete).length, 0
    )
    const totalTasks = goals.reduce((sum, goal) => sum + goal.tasks.length, 0)
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return `This week: ${completedTasks}/${totalTasks} tasks completed (${completionRate}%)`
  }

  // Show weekly progress report
  static showWeeklyReport(goals: Goal[]): void {
    const prefs = this.getPreferences()
    
    if (!prefs.enabled || !prefs.weeklyReportEnabled) {
      return
    }

    const report = this.generateWeeklyReport(goals)
    
    this.showNotification('Weekly Progress Report', {
      body: report,
      tag: 'weekly-report',
    })
  }
}
