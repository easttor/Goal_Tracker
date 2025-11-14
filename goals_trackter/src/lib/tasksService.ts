import { supabase } from './supabase'
import { Task, Priority } from '../types'

export class TasksService {
  private static tableName = 'tasks'

  // Get all tasks for a goal
  static async getTasksByGoal(goalId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('goal_id', goalId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  // Get tasks for current user
  static async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user tasks:', error)
      throw error
    }
  }

  // Get today's tasks
  static async getTodayTasks(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, goals(title)')
        .eq('user_id', userId)
        .eq('due_date', today)
        .order('priority', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching today tasks:', error)
      throw error
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_complete', false)
        .lt('due_date', today)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      throw error
    }
  }

  // Create a new task
  static async createTask(
    userId: string,
    goalId: string,
    taskData: Partial<Task>
  ): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: userId,
          goal_id: goalId,
          text: taskData.text,
          description: taskData.description,
          due_date: taskData.due_date || taskData.dueDate,
          is_complete: false,
          priority: taskData.priority || 'medium',
          category: taskData.category,
          parent_task_id: taskData.parent_task_id,
          depends_on_task_id: taskData.depends_on_task_id,
          order_index: taskData.order_index || 0,
          estimated_minutes: taskData.estimated_minutes
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  // Update a task
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const updateData: any = {}
      
      if (updates.text !== undefined) updateData.text = updates.text
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
      if (updates.is_complete !== undefined) updateData.is_complete = updates.is_complete
      if (updates.isComplete !== undefined) updateData.is_complete = updates.isComplete
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.parent_task_id !== undefined) updateData.parent_task_id = updates.parent_task_id
      if (updates.depends_on_task_id !== undefined) updateData.depends_on_task_id = updates.depends_on_task_id
      if (updates.order_index !== undefined) updateData.order_index = updates.order_index
      if (updates.estimated_minutes !== undefined) updateData.estimated_minutes = updates.estimated_minutes
      if (updates.actual_minutes !== undefined) updateData.actual_minutes = updates.actual_minutes

      // Set completed_at when completing a task
      if (updates.is_complete === true || updates.isComplete === true) {
        updateData.completed_at = new Date().toISOString()
      } else if (updates.is_complete === false || updates.isComplete === false) {
        updateData.completed_at = null
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  // Toggle task completion
  static async toggleTask(taskId: string): Promise<Task> {
    try {
      // Get current state
      const { data: currentTask, error: fetchError } = await supabase
        .from(this.tableName)
        .select('is_complete')
        .eq('id', taskId)
        .single()

      if (fetchError) throw fetchError

      const newState = !currentTask.is_complete
      const updateData: any = { 
        is_complete: newState,
        completed_at: newState ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error toggling task:', error)
      throw error
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', taskId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // Get subtasks (tasks with parent_task_id)
  static async getSubtasks(parentTaskId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching subtasks:', error)
      throw error
    }
  }

  // Get tasks by priority
  static async getTasksByPriority(userId: string, priority: Priority): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('priority', priority)
        .eq('is_complete', false)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by priority:', error)
      throw error
    }
  }

  // Get tasks by category
  static async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by category:', error)
      throw error
    }
  }

  // Bulk update task priorities
  static async updateTaskPriorities(taskIds: string[], priority: Priority): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ priority })
        .in('id', taskIds)

      if (error) throw error
    } catch (error) {
      console.error('Error updating task priorities:', error)
      throw error
    }
  }

  // Subscribe to task changes for a goal
  static subscribeToTaskChanges(goalId: string, callback: (tasks: Task[]) => void) {
    const subscription = supabase
      .channel(`tasks-${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `goal_id=eq.${goalId}`
        },
        async () => {
          const tasks = await this.getTasksByGoal(goalId)
          callback(tasks)
        }
      )
      .subscribe()

    return subscription
  }
}
