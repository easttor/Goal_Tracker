import { 
  Target, 
  BookOpen, 
  Dumbbell, 
  Plane, 
  Code, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Coffee 
} from 'lucide-react'

// Icon component map for dynamic rendering
export const iconMap = {
  Target: Target,
  BookOpen: BookOpen,
  Dumbbell: Dumbbell,
  Plane: Plane,
  Code: Code,
  Sparkles: Sparkles,
  GraduationCap: GraduationCap,
  Briefcase: Briefcase,
  Coffee: Coffee,
}

export const iconOptions = [
  { value: 'Target', label: 'Target' },
  { value: 'BookOpen', label: 'Book' },
  { value: 'Dumbbell', label: 'Dumbbell' },
  { value: 'Plane', label: 'Plane' },
  { value: 'Code', label: 'Code' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'GraduationCap', label: 'Cap' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Coffee', label: 'Coffee' },
]

export const colorOptions = [
  { value: 'blue', label: 'Blue', gradient: 'from-blue-400 to-blue-600' },
  { value: 'purple', label: 'Purple', gradient: 'from-purple-400 to-purple-600' },
  { value: 'green', label: 'Green', gradient: 'from-green-400 to-green-600' },
  { value: 'red', label: 'Red', gradient: 'from-red-400 to-red-600' },
  { value: 'yellow', label: 'Yellow', gradient: 'from-yellow-400 to-yellow-600' },
  { value: 'emerald', label: 'Emerald', gradient: 'from-emerald-400 to-emerald-600' },
  { value: 'cyan', label: 'Cyan', gradient: 'from-cyan-400 to-cyan-600' },
  { value: 'pink', label: 'Pink', gradient: 'from-pink-400 to-pink-600' },
  { value: 'indigo', label: 'Indigo', gradient: 'from-indigo-400 to-indigo-600' },
  { value: 'rose', label: 'Rose', gradient: 'from-rose-400 to-rose-600' },
  { value: 'teal', label: 'Teal', gradient: 'from-teal-400 to-teal-600' },
  { value: 'orange', label: 'Orange', gradient: 'from-orange-400 to-orange-600' },
  { value: 'violet', label: 'Violet', gradient: 'from-violet-400 to-violet-600' },
  { value: 'lime', label: 'Lime', gradient: 'from-lime-400 to-lime-600' },
  { value: 'amber', label: 'Amber', gradient: 'from-amber-400 to-amber-600' },
]

// Color mapping for consistent theme application
export const colorMap = {
  blue: {
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgMedium: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
    progressBg: 'bg-blue-200',
    progressFill: 'bg-gradient-to-r from-blue-400 to-blue-600',
    icon: 'bg-gradient-to-br from-blue-400 to-blue-600',
    checkbox: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500'
  },
  purple: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    bgMedium: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
    progressBg: 'bg-purple-200',
    progressFill: 'bg-gradient-to-r from-purple-400 to-purple-600',
    icon: 'bg-gradient-to-br from-purple-400 to-purple-600',
    checkbox: 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-500'
  },
  green: {
    gradient: 'from-green-400 to-green-600',
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    bgMedium: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    progressBg: 'bg-green-200',
    progressFill: 'bg-gradient-to-r from-green-400 to-green-600',
    icon: 'bg-gradient-to-br from-green-400 to-green-600',
    checkbox: 'bg-gradient-to-br from-green-400 to-green-600 border-green-500'
  },
  red: {
    gradient: 'from-red-400 to-red-600',
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    bgMedium: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-200',
    hover: 'hover:bg-red-100',
    progressBg: 'bg-red-200',
    progressFill: 'bg-gradient-to-r from-red-400 to-red-600',
    icon: 'bg-gradient-to-br from-red-400 to-red-600',
    checkbox: 'bg-gradient-to-br from-red-400 to-red-600 border-red-500'
  },
  yellow: {
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    bgMedium: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-100',
    progressBg: 'bg-yellow-200',
    progressFill: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    icon: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    checkbox: 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500'
  },
  emerald: {
    gradient: 'from-emerald-400 to-emerald-600',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    bgMedium: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-100',
    progressBg: 'bg-emerald-200',
    progressFill: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    icon: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    checkbox: 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500'
  },
  cyan: {
    gradient: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-50',
    bgMedium: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-100',
    progressBg: 'bg-cyan-200',
    progressFill: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
    icon: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
    checkbox: 'bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-500'
  },
  pink: {
    gradient: 'from-pink-400 to-pink-600',
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-50',
    bgMedium: 'bg-pink-100',
    text: 'text-pink-600',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-100',
    progressBg: 'bg-pink-200',
    progressFill: 'bg-gradient-to-r from-pink-400 to-pink-600',
    icon: 'bg-gradient-to-br from-pink-400 to-pink-600',
    checkbox: 'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-500'
  },
  indigo: {
    gradient: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-50',
    bgMedium: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-100',
    progressBg: 'bg-indigo-200',
    progressFill: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
    icon: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    checkbox: 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-500'
  },
  rose: {
    gradient: 'from-rose-400 to-rose-600',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-50',
    bgMedium: 'bg-rose-100',
    text: 'text-rose-600',
    border: 'border-rose-200',
    hover: 'hover:bg-rose-100',
    progressBg: 'bg-rose-200',
    progressFill: 'bg-gradient-to-r from-rose-400 to-rose-600',
    icon: 'bg-gradient-to-br from-rose-400 to-rose-600',
    checkbox: 'bg-gradient-to-br from-rose-400 to-rose-600 border-rose-500'
  },
  teal: {
    gradient: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-50',
    bgMedium: 'bg-teal-100',
    text: 'text-teal-600',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-100',
    progressBg: 'bg-teal-200',
    progressFill: 'bg-gradient-to-r from-teal-400 to-teal-600',
    icon: 'bg-gradient-to-br from-teal-400 to-teal-600',
    checkbox: 'bg-gradient-to-br from-teal-400 to-teal-600 border-teal-500'
  },
  orange: {
    gradient: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    bgMedium: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-100',
    progressBg: 'bg-orange-200',
    progressFill: 'bg-gradient-to-r from-orange-400 to-orange-600',
    icon: 'bg-gradient-to-br from-orange-400 to-orange-600',
    checkbox: 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-500'
  },
  violet: {
    gradient: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-50',
    bgMedium: 'bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-200',
    hover: 'hover:bg-violet-100',
    progressBg: 'bg-violet-200',
    progressFill: 'bg-gradient-to-r from-violet-400 to-violet-600',
    icon: 'bg-gradient-to-br from-violet-400 to-violet-600',
    checkbox: 'bg-gradient-to-br from-violet-400 to-violet-600 border-violet-500'
  },
  lime: {
    gradient: 'from-lime-400 to-lime-600',
    bg: 'bg-lime-500',
    bgLight: 'bg-lime-50',
    bgMedium: 'bg-lime-100',
    text: 'text-lime-600',
    border: 'border-lime-200',
    hover: 'hover:bg-lime-100',
    progressBg: 'bg-lime-200',
    progressFill: 'bg-gradient-to-r from-lime-400 to-lime-600',
    icon: 'bg-gradient-to-br from-lime-400 to-lime-600',
    checkbox: 'bg-gradient-to-br from-lime-400 to-lime-600 border-lime-500'
  },
  amber: {
    gradient: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    bgMedium: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-100',
    progressBg: 'bg-amber-200',
    progressFill: 'bg-gradient-to-r from-amber-400 to-amber-600',
    icon: 'bg-gradient-to-br from-amber-400 to-amber-600',
    checkbox: 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-500'
  },
}

// Helper function to get color classes
export const getColorClasses = (color: string) => {
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}