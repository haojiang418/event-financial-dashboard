"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MonthlyChart from "@/components/MonthlyChart"
import PieChart from "@/components/PieChart"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

interface MonthlyExpense {
  year: number
  month: number
  total: number
}

interface CategoryBreakdown {
  category: string
  total: number
}

export default function Dashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data to use if API is not available
        const mockMonthlyData = [
          { year: 2025, month: 1, total: 3400 },
          { year: 2025, month: 2, total: 2850 },
          { year: 2025, month: 3, total: 4200 },
          { year: 2025, month: 4, total: 3100 },
          { year: 2025, month: 5, total: 3800 },
        ]

        const mockCategoryData = [
          { category: "Retreats", total: 7200 },
          { category: "Kickbacks", total: 4100 },
          { category: "Events", total: 5500 },
          { category: "Other", total: 1200 },
        ]

        try {
          const [monthlyResponse, categoryResponse] = await Promise.all([
            fetch(`${apiUrl}/api/overview/monthly-expenses`, {
              signal: AbortSignal.timeout(5000),
            }),
            fetch(`${apiUrl}/api/overview/category-breakdown`, {
              signal: AbortSignal.timeout(5000),
            }),
          ])

          if (monthlyResponse.ok && categoryResponse.ok) {
            const monthlyData = await monthlyResponse.json()
            const categoryData = await categoryResponse.json()
            setMonthlyExpenses(monthlyData)
            setCategoryBreakdown(categoryData)
          } else {
            console.warn("API returned an error, using mock data")
            setMonthlyExpenses(mockMonthlyData)
            setCategoryBreakdown(mockCategoryData)
          }
        } catch (err) {
          console.warn("Error fetching dashboard data, using mock data:", err)
          setMonthlyExpenses(mockMonthlyData)
          setCategoryBreakdown(mockCategoryData)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [apiUrl])

  const calculateTotalSpent = () => {
    return categoryBreakdown.reduce((sum, category) => sum + category.total, 0)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Financial Tracker Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyExpenses} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">Total Spent to Date: ${calculateTotalSpent().toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  )
}
