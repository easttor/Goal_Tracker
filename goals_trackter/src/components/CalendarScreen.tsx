import React, { useState, useMemo } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Goal } from '../types'
import { CalendarService, CalendarEvent } from '../lib/calendarService'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, AlertCircle } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarScreenProps {
  goals: Goal[]
  onSelectEvent?: (event: CalendarEvent) => void
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ goals, onSelectEvent }) => {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  // Get all calendar events
  const events = useMemo(() => {
    return CalendarService.getAllEvents(goals)
  }, [goals])

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    return CalendarService.getUpcomingEvents(events, 7)
  }, [events])

  // Get overdue events
  const overdueEvents = useMemo(() => {
    return CalendarService.getOverdueEvents(events)
  }, [events])

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const style: React.CSSProperties = {
      backgroundColor: event.color,
      borderRadius: '6px',
      opacity: event.data && (event.data as any).is_complete ? 0.6 : 1,
      border: 'none',
      display: 'block',
      fontSize: '13px',
      padding: '2px 5px',
    }

    return { style }
  }

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const isRecurring = event.isRecurring
    const isCompleted = event.type === 'task' && (event.data as any).is_complete

    return (
      <div className="flex items-center gap-1 text-white">
        {isRecurring && <span className="text-xs">↻</span>}
        {isCompleted && <span className="text-xs">✓</span>}
        <span className="truncate">{event.title}</span>
      </div>
    )
  }

  // Navigate calendar
  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      const newDate = new Date(toolbar.date)
      if (toolbar.view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else if (toolbar.view === 'week') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() - 1)
      }
      toolbar.onNavigate('prev', newDate)
    }

    const goToNext = () => {
      const newDate = new Date(toolbar.date)
      if (toolbar.view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else if (toolbar.view === 'week') {
        newDate.setDate(newDate.getDate() + 7)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
      toolbar.onNavigate('next', newDate)
    }

    const goToToday = () => {
      toolbar.onNavigate('today', new Date())
    }

    const label = () => {
      const date = toolbar.date
      if (toolbar.view === 'month') {
        return format(date, 'MMMM yyyy')
      } else if (toolbar.view === 'week') {
        return format(date, 'MMMM yyyy')
      } else {
        return format(date, 'MMMM d, yyyy')
      }
    }

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {label()}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toolbar.onView('month')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              toolbar.view === 'month'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => toolbar.onView('week')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              toolbar.view === 'week'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => toolbar.onView('agenda')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              toolbar.view === 'agenda'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/calendar_background_1.jpg)',
          filter: 'brightness(0.3)'
        }}
      />
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm -z-10" />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendar
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage your deadlines
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {upcomingEvents.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Upcoming (7 days)
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {overdueEvents.length}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Overdue Tasks
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {events.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Total Events
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueEvents.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {overdueEvents.length} Overdue Task{overdueEvents.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {overdueEvents.slice(0, 3).map(e => e.title).join(', ')}
                {overdueEvents.length > 3 && ` and ${overdueEvents.length - 3} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-full">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
            onSelectEvent={onSelectEvent}
            popup
            className="dark-calendar"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">↻</span>
            <span className="text-gray-600 dark:text-gray-400">Recurring</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarScreen
