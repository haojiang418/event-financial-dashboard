"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ExpenseForm from "@/components/ExpenseForm"
import PeopleForm from "@/components/PeopleForm"
import ExpenseTable from "@/components/ExpenseTable"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

export interface ExpenseItem {
  _id: string
  itemName: string
  quantity: number
  costPerUnit: number
  totalCost: number
  people: string[]
  date: string
}

export default function CategoryPage() {
  const params = useParams()
  const categoryName = params.categoryName as string

  const [items, setItems] = useState<ExpenseItem[]>([])
  const [people, setPeople] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchItems = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryName}/items`)
      if (!response.ok) {
        throw new Error(`Failed to fetch items for ${categoryName}`)
      }
      const data = await response.json()
      setItems(data)
    } catch (err) {
      console.error(`Error fetching items for ${categoryName}:`, err)
      setError(`Failed to load items for ${categoryName}. Please try again later.`)
    }
  }

  const fetchPeople = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryName}/people`)
      if (!response.ok) {
        throw new Error(`Failed to fetch people for ${categoryName}`)
      }
      const data = await response.json()
      setPeople(data)
    } catch (err) {
      console.error(`Error fetching people for ${categoryName}:`, err)
      setError(`Failed to load people for ${categoryName}. Please try again later.`)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      // Mock data to use if API is not available
      const mockItems = [
        {
          _id: "mock-item-1",
          itemName: "Hotel booking",
          quantity: 10,
          costPerUnit: 150,
          totalCost: 1500,
          people: ["Alice", "Bob", "Carol"],
          date: "2025-05-20T00:00:00.000Z",
        },
        {
          _id: "mock-item-2",
          itemName: "Catering service",
          quantity: 50,
          costPerUnit: 25,
          totalCost: 1250,
          people: ["Alice", "David"],
          date: "2025-06-15T00:00:00.000Z",
        },
      ]

      const mockPeople = ["Alice", "Bob", "Carol", "David"]

      try {
        try {
          const [itemsResponse, peopleResponse] = await Promise.all([
            fetch(`${apiUrl}/api/categories/${categoryName}/items`, {
              signal: AbortSignal.timeout(5000),
            }),
            fetch(`${apiUrl}/api/categories/${categoryName}/people`, {
              signal: AbortSignal.timeout(5000),
            }),
          ])

          if (itemsResponse.ok && peopleResponse.ok) {
            const itemsData = await itemsResponse.json()
            const peopleData = await peopleResponse.json()
            setItems(itemsData)
            setPeople(peopleData)
          } else {
            console.warn("API returned an error, using mock data")
            setItems(mockItems)
            setPeople(mockPeople)
          }
        } catch (err) {
          console.warn("Error fetching category data, using mock data:", err)
          setItems(mockItems)
          setPeople(mockPeople)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError(`Failed to load data for ${categoryName}. Please try again later.`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryName, apiUrl])

  const handleItemAdded = async () => {
    await fetchItems()
  }

  const handlePersonAdded = async () => {
    await fetchPeople()
  }

  const handleItemDeleted = async (itemId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryName}/items/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      await fetchItems()
    } catch (err) {
      console.error("Error deleting item:", err)
      setError("Failed to delete item. Please try again later.")
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm categoryName={categoryName} people={people} onItemAdded={handleItemAdded} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage People</CardTitle>
          </CardHeader>
          <CardContent>
            <PeopleForm categoryName={categoryName} people={people} onPersonAdded={handlePersonAdded} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable items={items} onDeleteItem={handleItemDeleted} />
        </CardContent>
      </Card>
    </div>
  )
}
