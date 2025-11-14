declare module 'recharts' {
  import * as React from 'react'

  export interface CartesianGridProps {
    strokeDasharray?: string
    stroke?: string
  }
  
  export interface XAxisProps {
    dataKey?: string
    stroke?: string
    fontSize?: number
    [key: string]: any
  }
  
  export interface YAxisProps {
    stroke?: string
    fontSize?: number
    [key: string]: any
  }
  
  export interface TooltipProps<TValue extends any = any, TName extends any = any> {
    contentStyle?: React.CSSProperties
    [key: string]: any
  }
  
  export interface LegendProps {
    [key: string]: any
  }
  
  export interface LineProps {
    type?: string
    dataKey?: string
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
    dot?: any
    name?: string
    [key: string]: any
  }
  
  export interface AreaProps {
    type?: string
    dataKey?: string
    stroke?: string
    fillOpacity?: number
    fill?: string
    name?: string
    [key: string]: any
  }
  
  export interface BarProps {
    dataKey?: string
    fill?: string
    radius?: number[]
    name?: string
    [key: string]: any
  }
  
  export interface PieProps {
    data?: any[]
    cx?: string | number
    cy?: string | number
    labelLine?: boolean
    label?: any
    outerRadius?: number
    fill?: string
    dataKey?: string
    [key: string]: any
  }
  
  export interface CellProps {
    fill?: string
    [key: string]: any
  }

  export const CartesianGrid: React.FC<CartesianGridProps>
  export const XAxis: React.FC<XAxisProps>
  export const YAxis: React.FC<YAxisProps>
  export const Tooltip: React.FC<TooltipProps>
  export const Legend: React.FC<LegendProps>
  export const Line: React.FC<LineProps>
  export const Area: React.FC<AreaProps>
  export const Bar: React.FC<BarProps>
  export const Pie: React.FC<PieProps>
  export const Cell: React.FC<CellProps>
  
  export interface ResponsiveContainerProps {
    width?: string | number
    height?: number
    children?: React.ReactNode
  }
  
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>
  
  export interface LineChartProps {
    data?: any[]
    children?: React.ReactNode
    [key: string]: any
  }
  
  export interface AreaChartProps {
    data?: any[]
    children?: React.ReactNode
    [key: string]: any
  }
  
  export interface BarChartProps {
    data?: any[]
    children?: React.ReactNode
    [key: string]: any
  }
  
  export interface PieChartProps {
    children?: React.ReactNode
    [key: string]: any
  }

  export const LineChart: React.FC<LineChartProps>
  export const AreaChart: React.FC<AreaChartProps>
  export const BarChart: React.FC<BarChartProps>
  export const PieChart: React.FC<PieChartProps>
}
