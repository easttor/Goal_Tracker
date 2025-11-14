import { supabase } from './supabase'

export interface GoalTemplate {
  id: string
  title: string
  description: string
  category: string
  icon: string
  color: string
  default_tasks: any[]
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export class GoalTemplatesService {
  private static tableName = 'goal_templates'

  // Get all public templates
  static async getPublicTemplates(): Promise<GoalTemplate[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching templates:', error)
      return []
    }
  }

  // Get templates by category
  static async getTemplatesByCategory(category: string): Promise<GoalTemplate[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_public', true)
        .order('usage_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching templates by category:', error)
      return []
    }
  }

  // Get template by ID
  static async getTemplate(id: string): Promise<GoalTemplate | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching template:', error)
      return null
    }
  }

  // Increment usage count
  static async incrementUsageCount(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment', {
        table_name: this.tableName,
        row_id: id,
        column_name: 'usage_count'
      })

      // Fallback if RPC doesn't exist
      if (error) {
        const template = await this.getTemplate(id)
        if (template) {
          await supabase
            .from(this.tableName)
            .update({ usage_count: template.usage_count + 1 })
            .eq('id', id)
        }
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error)
    }
  }

  // Get all categories
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .eq('is_public', true)

      if (error) throw error
      
      const categories = [...new Set((data || []).map(item => item.category))]
      return categories.sort()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }
}
