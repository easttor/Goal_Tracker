// Task types
export interface Task {
  id: string // Changed from number to UUID
  goal_id?: string
  user_id?: string
  text: string
  description?: string
  due_date?: string // Renamed from dueDate
  dueDate?: string // Keep for backward compatibility
  is_complete: boolean // Renamed from isComplete
  isComplete?: boolean // Keep for backward compatibility
  priority?: 'high' | 'medium' | 'low'
  category?: string
  parent_task_id?: string
  depends_on_task_id?: string
  order_index?: number
  estimated_minutes?: number
  actual_minutes?: number
  recurring_pattern?: any // JSONB field for recurring tasks
  recurrence_rule?: string
  next_occurrence_date?: string
  last_occurrence_date?: string
  created_at?: string
  updated_at?: string
  completed_at?: string
}

// Milestone type
export interface Milestone {
  id: string
  goal_id: string
  user_id: string
  title: string
  description?: string
  target_value?: number
  current_value: number
  unit?: string
  is_achieved: boolean
  achieved_at?: string
  order_index: number
  created_at?: string
  updated_at?: string
}

// Habit category type
export type HabitCategory = 'health' | 'productivity' | 'learning' | 'wellness' | 'fitness' | 
                            'nutrition' | 'mindfulness' | 'social' | 'creative' | 'finance'

// Habit color type
export type HabitColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 
                         'pink' | 'teal' | 'indigo' | 'yellow' | 'cyan'

// Habit difficulty type
export type HabitDifficulty = 'beginner' | 'intermediate' | 'advanced'

// Habit type (enhanced)
export interface Habit {
  id: string
  goal_id?: string
  user_id: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  target_count: number
  current_streak: number
  best_streak: number
  last_completed_date?: string
  // New enhanced fields
  category: HabitCategory
  color: HabitColor
  icon: string
  reminder_time?: string
  reminder_enabled: boolean
  difficulty_level: HabitDifficulty
  notes_enabled: boolean
  photos_enabled: boolean
  is_paused: boolean
  pause_reason?: string
  paused_at?: string
  created_at?: string
  updated_at?: string
}

// Habit completion type (enhanced)
export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completion_date: string
  note?: string
  mood?: string
  created_at?: string
}

// Habit template type
export interface HabitTemplate {
  id: string
  name: string
  description?: string
  category: HabitCategory
  icon: string
  color: HabitColor
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  difficulty_level: HabitDifficulty
  target_count: number
  is_public: boolean
  usage_count: number
  created_at?: string
  updated_at?: string
}

// Habit achievement type
export interface HabitAchievement {
  id: string
  habit_id: string
  user_id: string
  achievement_type: 'streak_7' | 'streak_30' | 'streak_100' | 'streak_365' |
                     'completion_50' | 'completion_100' | 'completion_500' |
                     'perfect_week' | 'perfect_month' | 'comeback'
  title: string
  description?: string
  icon: string
  badge_color: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned_at?: string
  created_at?: string
}

// Habit note type
export interface HabitNote {
  id: string
  habit_id: string
  user_id: string
  completion_date: string
  note: string
  mood?: string
  created_at?: string
  updated_at?: string
}

// Habit progress photo type
export interface HabitProgressPhoto {
  id: string
  habit_id: string
  user_id: string
  photo_url: string
  caption?: string
  taken_at?: string
  created_at?: string
}

// Task template type
export interface TaskTemplate {
  id: string
  user_id?: string
  name: string
  description?: string
  category?: string
  template_data: any
  is_public: boolean
  usage_count: number
  created_at?: string
  updated_at?: string
}

// Achievement type
export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description?: string
  icon?: string
  earned_at?: string
  created_at?: string
}

// Comment type
export interface Comment {
  id: string
  user_id: string
  goal_id?: string
  task_id?: string
  content: string
  created_at?: string
  updated_at?: string
}

// Goal type (enhanced)
export interface Goal {
  id: string
  user_id?: string
  title: string
  description: string
  icon: string
  color: string
  image_url?: string
  deadline?: string
  category?: string
  is_recurring?: boolean
  recurrence_pattern?: string
  is_habit?: boolean
  status?: 'active' | 'completed' | 'archived'
  tasks: Task[] // For backward compatibility
  milestones?: Milestone[]
  habits?: Habit[]
  created_at?: string
  updated_at?: string
}

// Modal state type (enhanced)
export interface ModalState {
  type: 'addGoal' | 'editGoal' | 'addTask' | 'editTask' | 'delete' | 
        'addMilestone' | 'editMilestone' | 'addHabit' | 'editHabit' | 
        'addComment' | 'taskDetails' | null
  data: {
    id?: string
    goalId?: string
    taskId?: string | number
    milestoneId?: string
    habitId?: string
    [key: string]: any
  }
}

// Statistics types
export interface GoalStatistics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalTasks: number
  completedTasks: number
  completionRate: number
  categoryBreakdown: { [category: string]: number }
  priorityBreakdown: { high: number; medium: number; low: number }
}

// Priority type
export type Priority = 'high' | 'medium' | 'low'

// Category type
export type Category = 'health' | 'career' | 'personal' | 'education' | 'finance' | 'other'

// ============================================
// PHASE 3: Social Collaboration Types
// ============================================

// User Profile type
export interface UserProfile {
  id: string
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  is_public: boolean
  allow_followers: boolean
  show_activity: boolean
  created_at?: string
  updated_at?: string
  // Computed fields (not in DB)
  follower_count?: number
  following_count?: number
  is_following?: boolean
}

// User Follow type
export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at?: string
}

// Goal Share type
export interface GoalShare {
  id: string
  goal_id: string
  owner_id: string
  shared_with_user_id: string
  permission_level: 'viewer' | 'collaborator' | 'admin'
  created_at?: string
  updated_at?: string
  // Populated fields
  shared_with_user?: UserProfile
  goal?: Goal
}

// Team Goal type
export interface TeamGoal {
  id: string
  title: string
  description?: string
  creator_id: string
  icon?: string
  color: string
  target_value?: number
  current_value: number
  deadline?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  // Populated fields
  creator?: UserProfile
  members?: TeamMember[]
  member_count?: number
}

// Team Member type
export interface TeamMember {
  id: string
  team_goal_id: string
  user_id: string
  role: 'owner' | 'admin' | 'collaborator' | 'viewer'
  joined_at?: string
  // Populated fields
  user?: UserProfile
}

// Enhanced Comment type (Phase 3 version)
export interface CommentEnhanced {
  id: string
  user_id: string
  goal_id?: string
  task_id?: string
  team_goal_id?: string
  parent_comment_id?: string
  content: string
  mentions?: string[]
  created_at?: string
  updated_at?: string
  // Populated fields
  user?: UserProfile
  replies?: CommentEnhanced[]
  reactions?: CommentReaction[]
  reaction_count?: number
}

// Comment Reaction type
export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string
  reaction_type: 'like' | 'love' | 'celebrate' | 'support' | 'helpful'
  created_at?: string
  // Populated fields
  user?: UserProfile
}

// Activity Feed type
export interface ActivityFeedItem {
  id: string
  user_id: string
  activity_type: 'goal_completed' | 'task_completed' | 'milestone_reached' | 
                  'streak_achieved' | 'goal_shared' | 'team_joined' | 
                  'comment_added' | 'achievement_unlocked'
  goal_id?: string
  task_id?: string
  team_goal_id?: string
  metadata?: any
  is_public: boolean
  created_at?: string
  // Populated fields
  user?: UserProfile
  goal?: Goal
  task?: Task
  team_goal?: TeamGoal
}

// Goal visibility type
export type GoalVisibility = 'public' | 'private' | 'followers'

// Permission level type
export type PermissionLevel = 'viewer' | 'collaborator' | 'admin'

// Team role type
export type TeamRole = 'owner' | 'admin' | 'collaborator' | 'viewer'

// Reaction type
export type ReactionType = 'like' | 'love' | 'celebrate' | 'support' | 'helpful'

// Activity type
export type ActivityType = 'goal_completed' | 'task_completed' | 'milestone_reached' | 
                           'streak_achieved' | 'goal_shared' | 'team_joined' | 
                           'comment_added' | 'achievement_unlocked'

// Enhanced Goal type with social features
export interface GoalEnhanced extends Goal {
  visibility?: GoalVisibility
  is_shared?: boolean
  share_count?: number
  comment_count?: number
  collaborators?: UserProfile[]
}

// Social statistics type
export interface SocialStatistics {
  followers: number
  following: number
  shared_goals: number
  team_goals: number
  total_comments: number
  public_goals: number
}
