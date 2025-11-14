import { supabase } from './supabase'
import { Goal, Task, Milestone, Habit } from '../types'
import { TasksService } from './tasksService'
import { MilestonesService } from './milestonesService'
import { HabitsService } from './habitsService'
import { UserActivityService } from './userActivityService'

export class GoalsService {
  private static tableName = 'goals'

  // Get all goals for the current user (with relational data)
  static async getGoals(userId: string, includeRelations: boolean = true): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      let goals = data?.map(goal => ({
        ...goal,
        tasks: goal.tasks || []
      })) || []

      // Fetch relational tasks, milestones, and habits if requested
      if (includeRelations) {
        goals = await Promise.all(goals.map(async (goal) => {
          try {
            // Fetch relational tasks
            const relationalTasks = await TasksService.getTasksByGoal(goal.id)
            
            // Merge JSONB and relational tasks (relational takes precedence)
            const tasksMap = new Map<string, Task>()
            
            // Add JSONB tasks first
            goal.tasks.forEach((task: Task) => {
              const key = `jsonb-${task.id}`
              tasksMap.set(key, task)
            })
            
            // Add/override with relational tasks
            relationalTasks.forEach((task: Task) => {
              // Convert relational format to legacy format for compatibility
              const legacyTask: Task = {
                ...task,
                dueDate: task.due_date || task.dueDate || '',
                isComplete: task.is_complete
              }
              tasksMap.set(task.id, legacyTask)
            })
            
            const mergedTasks = Array.from(tasksMap.values())

            // Fetch milestones and habits
            const [milestones, habits] = await Promise.all([
              MilestonesService.getMilestones(goal.id),
              HabitsService.getHabitsByGoal(goal.id)
            ])

            return {
              ...goal,
              tasks: mergedTasks,
              milestones,
              habits
            }
          } catch (err) {
            console.error(`Error fetching relations for goal ${goal.id}:`, err)
            return goal
          }
        }))
      }

      return goals
    } catch (error) {
      console.error('Error fetching goals:', error)
      throw error
    }
  }

  // Create a new goal
  static async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: userId,
          title: goalData.title,
          description: goalData.description,
          icon: goalData.icon,
          color: goalData.color,
          image_url: goalData.image_url,
          deadline: goalData.deadline,
          category: goalData.category || 'personal',
          is_recurring: goalData.is_recurring || false,
          recurrence_pattern: goalData.recurrence_pattern,
          is_habit: goalData.is_habit || false,
          status: goalData.status || 'active',
          tasks: []
        }])
        .select()
        .single()

      if (error) throw error
      
      return {
        ...data,
        tasks: data.tasks || [],
        milestones: [],
        habits: []
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  // Update an existing goal
  static async updateGoal(goalId: string, goalData: Partial<Goal>): Promise<Goal> {
    try {
      const updateData: any = {}
      
      if (goalData.title !== undefined) updateData.title = goalData.title
      if (goalData.description !== undefined) updateData.description = goalData.description
      if (goalData.icon !== undefined) updateData.icon = goalData.icon
      if (goalData.color !== undefined) updateData.color = goalData.color
      if (goalData.image_url !== undefined) updateData.image_url = goalData.image_url
      if (goalData.deadline !== undefined) updateData.deadline = goalData.deadline
      if (goalData.category !== undefined) updateData.category = goalData.category
      if (goalData.is_recurring !== undefined) updateData.is_recurring = goalData.is_recurring
      if (goalData.recurrence_pattern !== undefined) updateData.recurrence_pattern = goalData.recurrence_pattern
      if (goalData.is_habit !== undefined) updateData.is_habit = goalData.is_habit
      if (goalData.status !== undefined) updateData.status = goalData.status
      if (goalData.tasks !== undefined) updateData.tasks = goalData.tasks

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error
      
      return {
        ...data,
        tasks: data.tasks || []
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  // Delete a goal
  static async deleteGoal(goalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', goalId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  // Update tasks for a goal (backward compatibility - JSONB)
  static async updateTasks(goalId: string, tasks: Task[], userId?: string): Promise<Goal> {
    try {
      // Get the old tasks to compare completion status
      const { data: oldGoal } = await supabase
        .from(this.tableName)
        .select('tasks, user_id')
        .eq('id', goalId)
        .single()

      const oldTasks: Task[] = oldGoal?.tasks || []
      const actualUserId = userId || oldGoal?.user_id

      // Track newly completed tasks
      if (actualUserId) {
        const newlyCompletedCount = tasks.filter((newTask: Task) => {
          const oldTask = oldTasks.find((t: Task) => String(t.id) === String(newTask.id))
          return newTask.isComplete && (!oldTask || !oldTask.isComplete)
        }).length

        if (newlyCompletedCount > 0) {
          await UserActivityService.incrementCounter(actualUserId, 'tasks', newlyCompletedCount)
        }

        // Check if goal is now complete
        const allTasksComplete = tasks.length > 0 && tasks.every((t: Task) => t.isComplete)
        const wasIncomplete = oldTasks.some((t: Task) => !t.isComplete)
        
        if (allTasksComplete && wasIncomplete) {
          await UserActivityService.incrementCounter(actualUserId, 'goals', 1)
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update({ tasks })
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error
      
      return {
        ...data,
        tasks: data.tasks || []
      }
    } catch (error) {
      console.error('Error updating tasks:', error)
      throw error
    }
  }

  // Subscribe to real-time changes
  static subscribeToChanges(userId: string, callback: (goals: Goal[]) => void) {
    const subscription = supabase
      .channel(`goals-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Trigger refetch in a non-blocking way
          this.getGoals(userId).then(goals => {
            callback(goals)
          }).catch(error => {
            console.error('Error refetching goals after real-time update:', error)
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to goals changes')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to goals channel')
        }
      })

    return subscription
  }

  // Create default goals for new users
  static async createDefaultGoals(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const defaultGoals = [
      {
        title: 'Fitness Journey',
        description: 'Get back in shape and run a 5k.',
        icon: 'Dumbbell',
        color: 'blue',
        category: 'health',
        image_url: 'https://placehold.co/600x400/3b82f6/FFF?text=Fitness',
        deadline: '2025-12-31',
        tasks: [
          { id: Date.now(), text: 'Workout for 30 minutes', dueDate: today, isComplete: false },
          { id: Date.now() + 1, text: 'Buy new running shoes', dueDate: today, isComplete: true },
          { id: Date.now() + 2, text: 'Sign up for 5k race', dueDate: tomorrowStr, isComplete: false }
        ]
      },
      {
        title: 'Read 52 Books',
        description: 'One book per week for the year.',
        icon: 'BookOpen',
        color: 'purple',
        category: 'personal',
        image_url: 'https://placehold.co/600x400/8b5cf6/FFF?text=Reading',
        deadline: '2025-12-31',
        tasks: [
          { id: Date.now() + 3, text: 'Finish "Dune"', dueDate: tomorrowStr, isComplete: false },
          { id: Date.now() + 4, text: 'Read for 30 minutes', dueDate: today, isComplete: false }
        ]
      }
    ]

    try {
      for (const goal of defaultGoals) {
        const { data: createdGoal, error: goalError } = await supabase
          .from(this.tableName)
          .insert([{
            user_id: userId,
            title: goal.title,
            description: goal.description,
            icon: goal.icon,
            color: goal.color,
            category: goal.category,
            image_url: goal.image_url,
            deadline: goal.deadline,
            tasks: goal.tasks,
            status: 'active'
          }])
          .select()
          .single()

        if (goalError) throw goalError

        // Also create relational tasks for the new structure
        if (createdGoal && goal.tasks.length > 0) {
          for (const task of goal.tasks) {
            await TasksService.createTask(userId, createdGoal.id, {
              text: task.text,
              due_date: task.dueDate,
              is_complete: task.isComplete,
              priority: 'medium'
            }).catch(err => console.error('Error creating relational task:', err))
          }
        }
      }
    } catch (error) {
      console.error('Error creating default goals:', error)
      throw error
    }
  }

  // Get goals by category
  static async getGoalsByCategory(userId: string, category: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(goal => ({ ...goal, tasks: goal.tasks || [] })) || []
    } catch (error) {
      console.error('Error fetching goals by category:', error)
      throw error
    }
  }

  // Get goals by status
  static async getGoalsByStatus(userId: string, status: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(goal => ({ ...goal, tasks: goal.tasks || [] })) || []
    } catch (error) {
      console.error('Error fetching goals by status:', error)
      throw error
    }
  }
}
