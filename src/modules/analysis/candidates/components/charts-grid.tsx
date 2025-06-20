"use client"

import { useMemo } from "react"
import { InteractiveChart } from "./interactive-chart"
import type { ChartDataPoint, FilterState } from "./types"
import { ResumeServerData } from "../../../../../types/globals"
interface ChartsGridProps {
  data: ResumeServerData[]
  filters: FilterState
  onFilterChange: (filterKey: keyof FilterState, values: string[]) => void
}

export function ChartsGrid({ data, filters, onFilterChange }: ChartsGridProps) {
  const chartData = useMemo(() => {
    const createChartData = (field: string, getValue: (item: ResumeServerData) => string): ChartDataPoint[] => {
      const counts = data.reduce(
        (acc, item) => {
          const value = getValue(item)
          acc[value] = (acc[value] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const total = data.length
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
    }

    return {
      gender: createChartData("gender", (item) => item.gender),
      experienceLevel: createChartData("experienceLevel", (item) => item.experienceLevel),
      contractType: createChartData("contractType", (item) => item.contractType),
      disability: createChartData("disability", (item) => item.disability),
      skillType: createChartData("skillType", (item) => item.skillType),
      ageCategory: createChartData("ageCategory", (item) => item.ageCategory),
    }
  }, [data])


  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <InteractiveChart
        title="Gender Distribution"
        data={chartData.gender}
        filterKey="gender"
        chartType="pie"
        colors={["#3B82F6", "#EF4444", "#10B981"]}
        activeFilters={filters.gender || []}
        onFilterChange={onFilterChange}
      />

      <InteractiveChart
        title="Experience Level"
        data={chartData.experienceLevel}
        filterKey="experienceLevel"
        chartType="bar"
        colors={["#8B5CF6", "#F59E0B", "#06B6D4"]}
        activeFilters={filters.experienceLevel || []}
        onFilterChange={onFilterChange}
      />

      <InteractiveChart
        title="Job Type Preference"
        data={chartData.contractType}
        filterKey="contractType"
        chartType="pie"
        colors={["#059669", "#DC2626", "#7C3AED"]}
        activeFilters={filters.contractType || []}
        onFilterChange={onFilterChange}
      />

      <InteractiveChart
        title="Skill Type"
        data={chartData.skillType}
        filterKey="skillType"
        chartType="pie"
        colors={["#2563EB", "#DB2777"]}
        activeFilters={filters.skillType || []}
        onFilterChange={onFilterChange}
      />

      <InteractiveChart
        title="Age Categories"
        data={chartData.ageCategory}
        filterKey="ageCategory"
        chartType="bar"
        colors={["#0EA5E9", "#84CC16", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]}
        activeFilters={filters.ageCategory || []}
        onFilterChange={onFilterChange}
      />

      <InteractiveChart
        title="Disability Status"
        data={chartData.disability}
        filterKey="disability"
        chartType="pie"
        colors={["#22C55E", "#F97316"]}
        activeFilters={filters.disability || []}
        onFilterChange={onFilterChange}
      />

      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-10 flex items-center justify-center">
        <span className="text-gray-700 font-semibold">Subscribe To Get Premium Interactive Charts</span>
      </div>
    </div>
  )
}
