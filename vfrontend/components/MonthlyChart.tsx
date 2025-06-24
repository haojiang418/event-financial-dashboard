"use client"

import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { format } from "date-fns"

interface MonthlyExpense {
  year: number
  month: number
  total: number
}

interface MonthlyChartProps {
  data: MonthlyExpense[]
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const chartData = data.map((item) => {
    const date = new Date(item.year, item.month - 1)
    return {
      name: format(date, "MMM yyyy"),
      total: item.total,
      month: item.month,
      year: item.year,
    }
  })

  chartData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Total: <span className="font-medium">${payload[0].value?.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis dataKey="name" stroke={isDark ? "#888" : "#666"} tick={{ fill: isDark ? "#ccc" : "#333" }} />
          <YAxis
            stroke={isDark ? "#888" : "#666"}
            tick={{ fill: isDark ? "#ccc" : "#333" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="total" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
