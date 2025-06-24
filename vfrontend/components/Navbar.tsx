"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"

interface Category {
  name: string
  _id: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const defaultCategories = [
          { name: "Retreats", _id: "default-retreats" },
          { name: "Kickbacks", _id: "default-kickbacks" },
          { name: "Events", _id: "default-events" },
          { name: "Other", _id: "default-other" },
        ]

        try {
          const response = await fetch(`${apiUrl}/api/categories`, {
            signal: AbortSignal.timeout(5000),
          })

          if (response.ok) {
            const data = await response.json()
            setCategories(data)
          } else {
            console.warn("API returned an error, using default categories")
            setCategories(defaultCategories)
          }
        } catch (error) {
          console.warn("Error fetching categories, using default categories:", error)
          setCategories(defaultCategories)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
      }
    }

    fetchCategories()
  }, [apiUrl])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (path.startsWith("/categories/") && pathname.startsWith(`/categories/${path.split("/")[2]}`)) {
      return true
    }
    return false
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              Financial Tracker
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dashboard")
                    ? "text-primary font-bold underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
              </Link>

              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.name}`}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(`/categories/${category.name}`)
                      ? "text-primary font-bold underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.name}
                </Link>
              ))}

              <ThemeToggle />
            </div>
          </div>

          <div className="flex md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/dashboard") ? "text-primary font-bold" : "text-muted-foreground"
              }`}
              onClick={closeMenu}
            >
              Overview
            </Link>

            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.name}`}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(`/categories/${category.name}`) ? "text-primary font-bold" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
