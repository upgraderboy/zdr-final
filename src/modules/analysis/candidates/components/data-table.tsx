"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, ChevronUp, ChevronDown, Filter } from "lucide-react"
import type { ResumeServerData } from "../../../../../types/globals"

type SortField = keyof ResumeServerData
type SortDirection = "asc" | "desc"

interface DataTableProps {
  data: ResumeServerData[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearFilters: () => void
}

export function DataTable({ data, searchTerm, onSearchChange, onClearFilters }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("firstName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [data, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    onSearchChange(value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    onClearFilters()
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    if (!sortedData.length) return

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Job Title",
      "City",
      "Country",
      "Gender",
      "Experience Level",
      "Job Type",
      "Skill Type",
      "Age",
      "Disability",
    ]

    const csvContent = [
      headers.join(","),
      ...sortedData.map((row) =>
        [
          row.firstName,
          row.lastName,
          row.email,
          row.jobTitle,
          row.city,
          row.country,
          row.gender,
          row.experienceLevel,
          row.contractType,
          row.skillType,
          row.age,
          row.disability,
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "candidates-data.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Candidates Data</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={!sortedData.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                {[
                  { key: "firstName" as SortField, label: "First Name" },
                  { key: "lastName" as SortField, label: "Last Name" },
                  { key: "email" as SortField, label: "Email" },
                  { key: "jobTitle" as SortField, label: "Job Title" },
                  { key: "city" as SortField, label: "Location" },
                  { key: "experienceLevel" as SortField, label: "Experience" },
                  { key: "contractType" as SortField, label: "Contract Type" },
                  { key: "skillType" as SortField, label: "Skills" },
                  { key: "age" as SortField, label: "Age" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="text-left p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon field={key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((candidate) => (
                <tr key={candidate.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-2">{candidate.firstName}</td>
                  <td className="p-2">{candidate.lastName}</td>
                  <td className="p-2 text-sm text-muted-foreground">{candidate.email}</td>
                  <td className="p-2">{candidate.jobTitle}</td>
                  <td className="p-2 text-sm">
                    {candidate.city}, {candidate.country}
                  </td>
                  <td className="p-2">
                    <Badge variant="secondary">{candidate.experienceLevel}</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">{candidate.contractType}</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={candidate.skillType === "TECH" ? "default" : "secondary"}>
                      {candidate.skillType}
                    </Badge>
                  </td>
                  <td className="p-2">{candidate.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
              {sortedData.length} candidates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
