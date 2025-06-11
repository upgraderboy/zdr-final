"use client"

import { useState, useMemo } from "react"
import { MetricCards } from "../components/metric-cards"
import { ChartsGrid } from "../components/charts-grid"
import { DataTable } from "../components/data-table"
import type { FilterState } from "../components/types"
import { trpc } from "@/trpc/client"
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeServerData } from "../../../../../types/globals"
type AgeCategory = "up to 20" | "21-30" | "31-40" | "41-50" | "51-60" | "60 and up"
function getAgeCategoryFromAge(age: number): AgeCategory {
  if (age <= 20) return "up to 20"
  if (age <= 30) return "21-30"
  if (age <= 40) return "31-40"
  if (age <= 50) return "41-50"
  if (age <= 60) return "51-60"
  return "60 and up"
}
export const AnalyticsDashboardSection = () => {
    return (
        <Suspense fallback={<AnalyticsDashboardSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <AnalyticsDashboardSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const AnalyticsDashboardSkeleton = () => {
    return (
        <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
        </div>
    )
}
export default function AnalyticsDashboardSuspense() {
  const [data] = trpc.analysis.candidateAnalysis.useSuspenseQuery();
  const [filters, setFilters] = useState<FilterState>({})
  const [searchTerm, setSearchTerm] = useState("")
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      ageCategory: getAgeCategoryFromAge(item.age),
    })) as ResumeServerData[]
  }, [data])

  // Filter data based on current filters and search term
  const filteredData = useMemo(() => {
    let result = processedData

    // Apply filters
    if (filters.gender?.length) {
      result = result.filter((item) => filters.gender!.includes(item.gender))
    }
    if (filters.experienceLevel?.length) {
      result = result.filter((item) => filters.experienceLevel!.includes(item.experienceLevel))
    }
    if (filters.contractType?.length) {
      result = result.filter((item) => filters.contractType!.includes(item.contractType))
    }
    if (filters.disability?.length) {
      result = result.filter((item) => filters.disability!.includes(item.disability))
    }
    if (filters.skillType?.length) {
      result = result.filter((item) => filters.skillType!.includes(item.skillType))
    }
    if (filters.ageCategory?.length) {
      result = result.filter((item) => filters.ageCategory!.includes(item.ageCategory))
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.firstName.toLowerCase().includes(term) ||
          item.lastName.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term) ||
          item.jobTitle.toLowerCase().includes(term) ||
          item.city.toLowerCase().includes(term) ||
          item.country.toLowerCase().includes(term),
      )
    }

    return result
  }, [data, filters, searchTerm])

  const handleFilterChange = (key: keyof FilterState, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values.length > 0 ? values : undefined,
    }))
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center text-destructive">
//             <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
//             <p>{error}</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Resume Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of candidate data with interactive filtering and insights.
          </p>
        </div>

        <MetricCards data={filteredData} />

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Interactive Charts</h2>
          <p className="text-sm text-muted-foreground">
            Click on chart segments to filter data across all visualizations and the table below.
          </p>
        </div>

        <ChartsGrid data={filteredData} filters={filters} onFilterChange={handleFilterChange} />

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Candidate Records</h2>
          <p className="text-sm text-muted-foreground">Sortable and searchable table with export functionality.</p>
        </div>

        <DataTable
          data={filteredData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}

        />
      </div>
    </div>
  )
}
