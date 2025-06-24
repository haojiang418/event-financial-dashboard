"use client"

import { useTheme } from "next-themes"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  type TooltipProps,
} from "recharts"

interface CategoryBreakdown {
  category: string
  total: number
}

interface PieChartProps {
  data: CategoryBreakdown[]
}

export default function PieChart({ data }: PieChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const totalAmount = data.reduce((sum, item) => sum + item.total, 0)

  const COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6"]

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = ((item.total / totalAmount) * 100).toFixed(1)

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium">{item.category}</p>
          <p className="text-sm">
            ${item.total.toLocaleString()} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span style={{ color: isDark ? "#ccc" : "#333" }}>{value}</span>} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
