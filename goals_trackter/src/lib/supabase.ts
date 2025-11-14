import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://poadoavnqqtdkqnpszaw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWRvYXZucXF0ZGtxbnBzemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTM1NTgsImV4cCI6MjA3NzY4OTU1OH0.3nZZjRvIsGm2twqkSHP0UN8kCjgLpy5FYo7mBCLUoag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  image_url: string;
  deadline: string;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  text: string;
  dueDate: string;
  isComplete: boolean;
}
