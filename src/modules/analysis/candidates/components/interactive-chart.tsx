"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartDataPoint, FilterState } from "./types"

interface InteractiveChartProps {
  title: string
  data: ChartDataPoint[]
  filterKey: keyof FilterState
  chartType?: "pie" | "bar"
  colors?: string[]
  activeFilters: string[]
  onFilterChange: (filterKey: keyof FilterState, values: string[]) => void
}

const DEFAULT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function InteractiveChart({
  title,
  data,
  filterKey,
  chartType = "pie",
  colors = DEFAULT_COLORS,
  activeFilters,
  onFilterChange,
}: InteractiveChartProps) {
  const handleClick = (entry: ChartDataPoint) => {
    const isSelected = activeFilters.includes(entry.name)

    let newFilters: string[]
    if (isSelected) {
      newFilters = activeFilters.filter((f) => f !== entry.name)
    } else {
      newFilters = [...activeFilters, entry.name]
    }

    onFilterChange(filterKey, newFilters)
  }

  const getItemColor = (index: number, isSelected: boolean) => {
    const baseColor = colors[index % colors.length]
    if (activeFilters.length === 0) {
      // No filters applied - show all items in full color
      return baseColor
    }
    if (isSelected) {
      // Item is selected - show in full color
      return baseColor
    }
    // Item is not selected but filters are applied - show dimmed version
    return baseColor + "40" // Add 40 for 25% opacity
  }

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value: number) => [value, "Count"]} labelFormatter={(label: string) => `${label}`} />
            <Bar dataKey="value" onClick={handleClick} cursor="pointer">
              {data.map((entry, index) => {
                const isSelected = activeFilters.includes(entry.name)
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={getItemColor(index, isSelected)}
                    stroke={isSelected && activeFilters.length > 0 ? "#374151" : "none"}
                    strokeWidth={isSelected && activeFilters.length > 0 ? 2 : 0}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" onClick={handleClick} cursor="pointer">
            {data.map((entry, index) => {
              const isSelected = activeFilters.includes(entry.name)
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={getItemColor(index, isSelected)}
                  stroke={isSelected && activeFilters.length > 0 ? "#374151" : "none"}
                  strokeWidth={isSelected && activeFilters.length > 0 ? 3 : 0}
                />
              )
            })}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, item) => {
              const percentage = item.payload?.percentage || 0
              return [`${value} (${percentage.toFixed(1)}%)`, "Candidates"]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((entry, index) => {
            const isSelected = activeFilters.includes(entry.name)
            const showAsActive = activeFilters.length === 0 || isSelected
            return (
              <div
                key={entry.name}
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-all duration-200 ${
                  showAsActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                onClick={() => handleClick(entry)}
              >
                <div
                  className="w-3 h-3 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: getItemColor(index, isSelected),
                    border: showAsActive ? "1px solid rgba(255,255,255,0.3)" : "none",
                  }}
                />
                <span className={showAsActive ? "font-medium" : ""}>
                  {entry.name} ({entry.value})
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}