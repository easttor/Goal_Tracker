import { Task } from '../types'
import { supabase } from './supabase'

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number // Every X days/weeks/months
  daysOfWeek?: number[] // For weekly: 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number // For monthly: 1-31
  endDate?: string // Optional end date for recurrence
  skipWeekends?: boolean
  skipHolidays?: boolean
}

export class RecurringTasksService {
  // Check if a task is recurring
  static isRecurring(task: Task): boolean {
    return !!(task as any).recurring_pattern
  }

  // Get recurring pattern from task
  static getPattern(task: Task): RecurringPattern | null {
    const pattern = (task as any).recurring_pattern
    if (!pattern) return null
    
    if (typeof pattern === 'string') {
      try {
        return JSON.parse(pattern)
      } catch {
        return null
      }
    }
    
    return pattern
  }

  // Calculate next occurrence date
  static calculateNextOccurrence(currentDate: Date, pattern: RecurringPattern): Date | null {
    const next = new Date(currentDate)

    switch (pattern.frequency) {
      case 'daily':
        next.setDate(next.getDate() + pattern.interval)
        
        // Skip weekends if configured
        if (pattern.skipWeekends) {
          while (next.getDay() === 0 || next.getDay() === 6) {
            next.setDate(next.getDate() + 1)
          }
        }
        break

      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next matching day of week
          const currentDay = next.getDay()
          const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b)
          
          // Find next day in current week
          let nextDay = sortedDays.find(day => day > currentDay)
          
          if (nextDay !== undefined) {
            next.setDate(next.getDate() + (nextDay - currentDay))
          } else {
            // Move to first day of next week cycle
            const daysToAdd = 7 - currentDay + sortedDays[0]
            next.setDate(next.getDate() + daysToAdd)
          }
        } else {
          next.setDate(next.getDate() + (7 * pattern.interval))
        }
        break

      case 'monthly':
        if (pattern.dayOfMonth) {
          next.setMonth(next.getMonth() + pattern.interval)
          next.setDate(Math.min(pattern.dayOfMonth, this.getDaysInMonth(next)))
        } else {
          next.setMonth(next.getMonth() + pattern.interval)
        }
        break

      case 'yearly':
        next.setFullYear(next.getFullYear() + pattern.interval)
        break

      case 'custom':
        next.setDate(next.getDate() + pattern.interval)
        break

      default:
        return null
    }

    // Check if we've passed the end date
    if (pattern.endDate && next > new Date(pattern.endDate)) {
      return null
    }

    return next
  }

  // Complete a recurring task and create next occurrence
  static async completeRecurringTask(task: Task, userId: string): Promise<Task | null> {
    const pattern = this.getPattern(task)
    if (!pattern) return null

    try {
      // Mark current task as complete
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          is_complete: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id)

      if (updateError) throw updateError

      // Calculate next occurrence
      const currentDueDate = task.due_date ? new Date(task.due_date) : new Date()
      const nextDate = this.calculateNextOccurrence(currentDueDate, pattern)

      if (!nextDate) return null

      // Create new task instance for next occurrence
      const newTask = {
        goal_id: task.goal_id,
        user_id: userId,
        text: task.text,
        description: task.description,
        due_date: nextDate.toISOString().split('T')[0],
        is_complete: false,
        priority: task.priority,
        category: task.category,
        recurring_pattern: task.recurring_pattern,
      }

      const { data: createdTask, error: createError } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single()

      if (createError) throw createError

      return createdTask as Task
    } catch (error) {
      console.error('Error completing recurring task:', error)
      return null
    }
  }

  // Get all due recurring tasks that need new instances
  static async processRecurringTasks(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get all incomplete recurring tasks with due dates in the past
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_complete', false)
        .not('recurring_pattern', 'is', null)
        .lte('due_date', today)

      if (error) throw error
      if (!tasks || tasks.length === 0) return

      // Process each overdue recurring task
      for (const task of tasks) {
        const pattern = this.getPattern(task)
        if (!pattern) continue

        // If task is overdue, auto-complete and create next instance
        await this.completeRecurringTask(task, userId)
      }
    } catch (error) {
      console.error('Error processing recurring tasks:', error)
    }
  }

  // Create recurring task pattern
  static createPattern(
    frequency: RecurringPattern['frequency'],
    interval: number = 1,
    options: Partial<RecurringPattern> = {}
  ): RecurringPattern {
    return {
      frequency,
      interval,
      ...options,
    }
  }

  // Get human-readable description of recurring pattern
  static getPatternDescription(pattern: RecurringPattern): string {
    const { frequency, interval, daysOfWeek, dayOfMonth } = pattern
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    switch (frequency) {
      case 'daily':
        if (interval === 1) {
          return pattern.skipWeekends ? 'Every weekday' : 'Every day'
        }
        return `Every ${interval} days`

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = daysOfWeek.map(d => dayNames[d]).join(', ')
          return `Every week on ${days}`
        }
        return interval === 1 ? 'Every week' : `Every ${interval} weeks`

      case 'monthly':
        if (dayOfMonth) {
          return `Monthly on day ${dayOfMonth}`
        }
        return interval === 1 ? 'Every month' : `Every ${interval} months`

      case 'yearly':
        return interval === 1 ? 'Every year' : `Every ${interval} years`

      case 'custom':
        return `Every ${interval} days`

      default:
        return 'Unknown pattern'
    }
  }

  // Validate recurring pattern
  static validatePattern(pattern: RecurringPattern): boolean {
    if (!pattern.frequency || pattern.interval < 1) {
      return false
    }

    if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
      if (pattern.daysOfWeek.some(d => d < 0 || d > 6)) {
        return false
      }
    }

    if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
      if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
        return false
      }
    }

    return true
  }

  // Helper: Get number of days in month
  private static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get all upcoming occurrences for a recurring task
  static getUpcomingOccurrences(task: Task, count: number = 5): Date[] {
    const pattern = this.getPattern(task)
    if (!pattern) return []

    const occurrences: Date[] = []
    let currentDate = task.due_date ? new Date(task.due_date) : new Date()

    for (let i = 0; i < count; i++) {
      const next = this.calculateNextOccurrence(currentDate, pattern)
      if (!next) break
      
      occurrences.push(next)
      currentDate = next
    }

    return occurrences
  }
}
