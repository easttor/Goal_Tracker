import { Goal, Task, Milestone } from '../types'
import { RecurringTasksService } from './recurringTasksService'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: 'goal' | 'task' | 'milestone' | 'habit'
  color: string
  data: Goal | Task | Milestone
  isRecurring?: boolean
  recurringInfo?: string
}

export class CalendarService {
  // Convert goals to calendar events
  static goalsToEvents(goals: Goal[]): CalendarEvent[] {
    return goals
      .filter(goal => goal.deadline)
      .map(goal => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        start: new Date(goal.deadline!),
        end: new Date(goal.deadline!),
        allDay: true,
        type: 'goal' as const,
        color: goal.color,
        data: goal,
      }))
  }

  // Convert tasks to calendar events
  static tasksToEvents(goals: Goal[]): CalendarEvent[] {
    const events: CalendarEvent[] = []

    goals.forEach(goal => {
      goal.tasks
        .filter(task => task.due_date || task.dueDate)
        .forEach(task => {
          const dueDate = task.due_date || task.dueDate || ''
          const isRecurring = RecurringTasksService.isRecurring(task)
          const pattern = isRecurring ? RecurringTasksService.getPattern(task) : null

          events.push({
            id: `task-${task.id}`,
            title: task.text,
            start: new Date(dueDate),
            end: new Date(dueDate),
            allDay: true,
            type: 'task' as const,
            color: this.getPriorityColor(task.priority),
            data: task,
            isRecurring,
            recurringInfo: pattern ? RecurringTasksService.getPatternDescription(pattern) : undefined,
          })

          // Add future occurrences for recurring tasks
          if (isRecurring && pattern) {
            const futureOccurrences = RecurringTasksService.getUpcomingOccurrences(task, 10)
            futureOccurrences.forEach((date, index) => {
              events.push({
                id: `task-${task.id}-occurrence-${index}`,
                title: `${task.text} (recurring)`,
                start: date,
                end: date,
                allDay: true,
                type: 'task' as const,
                color: this.getPriorityColor(task.priority),
                data: task,
                isRecurring: true,
                recurringInfo: pattern ? RecurringTasksService.getPatternDescription(pattern) : undefined,
              })
            })
          }
        })
    })

    return events
  }

  // Convert milestones to calendar events
  static milestonesToEvents(goals: Goal[]): CalendarEvent[] {
    const events: CalendarEvent[] = []

    goals.forEach(goal => {
      if (goal.milestones) {
        goal.milestones
          .filter(milestone => milestone.achieved_at)
          .forEach(milestone => {
            events.push({
              id: `milestone-${milestone.id}`,
              title: `${milestone.title}`,
              start: new Date(milestone.achieved_at!),
              end: new Date(milestone.achieved_at!),
              allDay: true,
              type: 'milestone' as const,
              color: goal.color,
              data: milestone,
            })
          })
      }
    })

    return events
  }

  // Get all calendar events
  static getAllEvents(goals: Goal[]): CalendarEvent[] {
    return [
      ...this.goalsToEvents(goals),
      ...this.tasksToEvents(goals),
      ...this.milestonesToEvents(goals),
    ]
  }

  // Filter events by date range
  static getEventsByDateRange(
    events: CalendarEvent[],
    startDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    return events.filter(event => {
      const eventStart = new Date(event.start)
      return eventStart >= startDate && eventStart <= endDate
    })
  }

  // Get events for a specific day
  static getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= dayStart && eventDate <= dayEnd
    })
  }

  // Get upcoming events (next 7 days)
  static getUpcomingEvents(events: CalendarEvent[], days: number = 7): CalendarEvent[] {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + days)

    return events
      .filter(event => {
        const eventDate = new Date(event.start)
        return eventDate >= now && eventDate <= future
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Get overdue events
  static getOverdueEvents(events: CalendarEvent[]): CalendarEvent[] {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return events
      .filter(event => {
        const eventDate = new Date(event.start)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < now && event.type === 'task' && !(event.data as Task).is_complete
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Count events by type
  static getEventCountByType(events: CalendarEvent[]): Record<string, number> {
    return events.reduce((counts, event) => {
      counts[event.type] = (counts[event.type] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  // Helper: Get color for task priority
  private static getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high':
        return '#ef4444' // red
      case 'medium':
        return '#f59e0b' // amber
      case 'low':
        return '#10b981' // green
      default:
        return '#6b7280' // gray
    }
  }

  // Check for scheduling conflicts
  static findConflicts(events: CalendarEvent[]): CalendarEvent[][] {
    const conflicts: CalendarEvent[][] = []
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    )

    for (let i = 0; i < sortedEvents.length; i++) {
      const currentEvent = sortedEvents[i]
      const sameDay = sortedEvents.filter(event => {
        const currentStart = new Date(currentEvent.start)
        const eventStart = new Date(event.start)
        return currentStart.toDateString() === eventStart.toDateString() &&
               event.id !== currentEvent.id &&
               event.type === 'task'
      })

      if (sameDay.length >= 3) { // More than 3 tasks on same day = potential conflict
        const conflictGroup = [currentEvent, ...sameDay]
        if (!conflicts.some(group => 
          group.some(e => e.id === currentEvent.id)
        )) {
          conflicts.push(conflictGroup)
        }
      }
    }

    return conflicts
  }

  // Get productivity heatmap data (tasks completed per day)
  static getHeatmapData(
    goals: Goal[],
    startDate: Date,
    endDate: Date
  ): Map<string, number> {
    const heatmap = new Map<string, number>()
    
    goals.forEach(goal => {
      goal.tasks
        .filter(task => task.is_complete && task.completed_at)
        .forEach(task => {
          const completedDate = new Date(task.completed_at!)
          if (completedDate >= startDate && completedDate <= endDate) {
            const dateKey = completedDate.toISOString().split('T')[0]
            heatmap.set(dateKey, (heatmap.get(dateKey) || 0) + 1)
          }
        })
    })

    return heatmap
  }
}
