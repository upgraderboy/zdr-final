"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Building2, Briefcase, MapPin, Users } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchableDropdown } from "./searchable-dropdown"
import type { JobData, AnalyticsFilters, SummaryStats } from "./job-types"

import { trpc } from "@/trpc/client"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function JobAnalyticsDashboard() {
  const [filters, /* unused */] = useState<AnalyticsFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof JobData; direction: "asc" | "desc" } | null>(null)
  const [selectedChartData, setSelectedChartData] = useState<Record<string, string[]>>({})
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({})
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])

  // Get unique domain types for dropdown
  const [jobs] = trpc.job.getAllJobs.useSuspenseQuery();
  const domains = Array.from(new Set(jobs.map((job) => job.domainType)))
  const domainOptions = domains.sort()

  // Filter jobs based on current filters and search
  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      // Apply domain filter from dropdown
      if (selectedDomains.length > 0 && !selectedDomains.includes(job.domainType)) {
        return false
      }

      // Apply chart-based filters
      const chartFilters = Object.entries(selectedChartData)
      for (const [chartType, selectedValues] of chartFilters) {
        if (selectedValues.length === 0) continue

        switch (chartType) {
          case "contractType":
            if (!selectedValues.includes(job.contractType)) return false
            break
          case "experienceLevel":
            if (!selectedValues.includes(job.experienceLevel)) return false
            break
          case "genderPreference":
            if (!selectedValues.includes(job.genderPreference)) return false
            break
          case "jobType":
            if (!selectedValues.includes(job.jobType)) return false
            break
          case "isDisabilityAllowed":
            if (!selectedValues.includes(job.isDisabilityAllowed ? "Yes" : "No")) return false
            break
        }
      }

      // Apply global search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesGlobalSearch =
          job.title.toLowerCase().includes(searchLower) ||
          job.companyName?.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.stateName?.toLowerCase().includes(searchLower) ||
          job.domainType.toLowerCase().includes(searchLower)
        if (!matchesGlobalSearch) return false
      }

      // Apply column-specific search filters
      for (const [column, searchValue] of Object.entries(columnSearches)) {
        if (!searchValue) continue

        const searchLower = searchValue.toLowerCase()
        let columnValue = ""

        switch (column) {
          case "title":
            columnValue = job.title.toLowerCase()
            break
          case "companyName":
            columnValue = (job.companyName || "").toLowerCase()
            break
          case "contractType":
            columnValue = job.contractType.toLowerCase()
            break
          case "experienceLevel":
            columnValue = job.experienceLevel.toLowerCase()
            break
          case "salaryRange":
            columnValue = (job.salaryRange || "").toLowerCase()
            break
          case "stateName":
            columnValue = (job.stateName || "").toLowerCase()
            break
          case "domainType":
            columnValue = job.domainType.toLowerCase()
            break
          case "jobType":
            columnValue = job.jobType.toLowerCase()
            break
          case "isDisabilityAllowed":
            columnValue = job.isDisabilityAllowed ? "yes" : "no"
            break
        }

        if (!columnValue.includes(searchLower)) return false
      }

      return true
    })

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [filters, searchTerm, sortConfig, selectedChartData, columnSearches, selectedDomains])

  // Calculate summary statistics
  const summaryStats: SummaryStats = useMemo(() => {
    const uniqueCompanies = new Set(filteredJobs.map((job) => job.companyName)).size
    const remoteJobs = filteredJobs.filter((job) => job.jobType === "Remote").length
    const disabilityFriendlyJobs = filteredJobs.filter((job) => job.isDisabilityAllowed).length

    // Calculate actual average salary
    const jobsWithSalary = filteredJobs.filter((job) => job.salaryRange)
    let averageSalary = "Not available"

    if (jobsWithSalary.length > 0) {
      const salaryValues = jobsWithSalary
        .map((job) => {
          const salaryRange = job.salaryRange!
          // Extract numbers from salary range like "₹15 LPA - ₹25 LPA"
          const matches = salaryRange.match(/₹(\d+(?:\.\d+)?)/g)
          if (matches && matches.length >= 2) {
            const min = Number.parseFloat(matches[0].replace("₹", ""))
            const max = Number.parseFloat(matches[1].replace("₹", ""))
            return (min + max) / 2
          } else if (matches && matches.length === 1) {
            return Number.parseFloat(matches[0].replace("₹", ""))
          }
          return 0
        })
        .filter((val) => val > 0)

      if (salaryValues.length > 0) {
        const avgValue = salaryValues.reduce((sum, val) => sum + val, 0) / salaryValues.length
        averageSalary = `₹${avgValue.toFixed(1)} LPA`
      }
    }

    return {
      totalJobs: filteredJobs.length,
      totalCompanies: uniqueCompanies,
      remoteJobs,
      disabilityFriendlyJobs,
      averageSalary,
    }
  }, [filteredJobs])

  // Chart data preparation
  const contractTypeData = useMemo(() => {
    const counts = filteredJobs.reduce(
      (acc, job) => {
        acc[job.contractType] = (acc[job.contractType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([type, count]) => ({ name: type, value: count }))
  }, [filteredJobs])

  const experienceLevelData = useMemo(() => {
    const counts = filteredJobs.reduce(
      (acc, job) => {
        acc[job.experienceLevel] = (acc[job.experienceLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([level, count]) => ({ name: level, value: count }))
  }, [filteredJobs])

  const remoteData = useMemo(() => {
    return [
      { name: "Remote", value: filteredJobs.filter((job) => job.jobType === "Remote").length },
      { name: "On-site", value: filteredJobs.filter((job) => job.jobType === "On Site").length },
      { name: "Hybrid", value: filteredJobs.filter((job) => job.jobType === "Hybrid").length }
    ]
  }, [filteredJobs])

  const disabilityData = useMemo(() => {
    const allowed = filteredJobs.filter((job) => job.isDisabilityAllowed).length
    const notAllowed = filteredJobs.length - allowed
    return [
      { name: "Yes", value: allowed },
      { name: "No", value: notAllowed },
    ]
  }, [filteredJobs])

  const genderPreferenceData = useMemo(() => {
    const counts = filteredJobs.reduce(
      (acc, job) => {
        acc[job.genderPreference] = (acc[job.genderPreference] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([preference, count]) => ({ name: preference, value: count }))
  }, [filteredJobs])

  const handleChartClick = (chartType: string, dataKey: string) => {
    setSelectedChartData((prev) => {
      const currentSelected = prev[chartType] || []
      const newSelected = currentSelected.includes(dataKey)
        ? currentSelected.filter((item) => item !== dataKey)
        : [...currentSelected, dataKey]

      return {
        ...prev,
        [chartType]: newSelected,
      }
    })
  }

  const handleSort = (key: keyof JobData) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null
      }
      return { key, direction: "asc" }
    })
  }

  const handleColumnSearch = (column: string, value: string) => {
    setColumnSearches((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Company",
      "Domain",
      "Job Type",
      "Experience Level",
      "Salary Range",
      "Location",
      "Remote",
      "Disability Friendly",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredJobs.map((job) =>
        [
          `"${job.title}"`,
          `"${job.companyName || ""}"`,
          job.domainType,
          job.contractType,
          job.experienceLevel,
          `"${job.salaryRange || ""}"`,
          `"${job.stateName || ""}"`,
          job.jobType,
          job.isDisabilityAllowed ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "jobs-analytics.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearAllFilters = () => {
    setSelectedChartData({})
    setSearchTerm("")
    setSortConfig(null)
    setColumnSearches({})
    setSelectedDomains([])
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job Analytics Dashboard</h1>
          <p className="text-muted-foreground">Analyze job market trends and opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Domain Filter Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Domain Filter</CardTitle>
          <CardDescription>Filter jobs by domain type using fuzzy search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <SearchableDropdown
              options={domainOptions}
              selectedValues={selectedDomains}
              onSelectionChange={setSelectedDomains}
              placeholder="Select domains..."
              label="Job Domains"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remote Jobs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.remoteJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disability Friendly</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.disabilityFriendlyJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.averageSalary}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Filters */}
      {(Object.entries(selectedChartData).some(([/* unused */, values]) => values.length > 0) || selectedDomains.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedDomains.map((domain) => (
                <Badge
                  key={`domain-${domain}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedDomains((prev) => prev.filter((d) => d !== domain))}
                >
                  Domain: {domain} ×
                </Badge>
              ))}
              {Object.entries(selectedChartData).map(([chartType, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${chartType}-${value}`}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleChartClick(chartType, value)}
                  >
                    {chartType}: {value} ×
                  </Badge>
                )),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Job Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Job Types</CardTitle>
            <CardDescription>Distribution of job types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  value: { label: "Jobs", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contractTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      onClick={(data) => handleChartClick("contractType", data.name)}
                    >
                      {contractTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke={selectedChartData.contractType?.includes(entry.name) ? "#000" : "none"}
                          strokeWidth={selectedChartData.contractType?.includes(entry.name) ? 2 : 0}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Experience Level Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Levels</CardTitle>
            <CardDescription>Jobs by experience requirement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  value: { label: "Jobs", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experienceLevelData} margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      onClick={(data: { name: string }) => handleChartClick("experienceLevel", data.name)}
                      style={{ cursor: "pointer" }}
                      maxBarSize={40}
                    >
                      {experienceLevelData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedChartData.experienceLevel?.includes(entry.name) ? COLORS[1] : COLORS[2]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Remote vs On-site vs Hybrid Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Work Location</CardTitle>
            <CardDescription>Remote vs On-site vs Hybrid opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  value: { label: "Jobs", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={remoteData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      onClick={(data) => handleChartClick("jobType", data.name)}
                    >
                      {remoteData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index + 2]}
                          stroke={selectedChartData.jobType?.includes(entry.name) ? "#000" : "none"}
                          strokeWidth={selectedChartData.jobType?.includes(entry.name) ? 2 : 0}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disability Friendly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Disability Accessibility</CardTitle>
            <CardDescription>Disability-friendly job opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  value: { label: "Jobs", color: "hsl(var(--chart-4))" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disabilityData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      onClick={(data: { name: string }) => handleChartClick("isDisabilityAllowed", data.name)}
                      style={{ cursor: "pointer" }}
                      maxBarSize={60}
                    >
                      {disabilityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedChartData.isDisabilityAllowed?.includes(entry.name) ? COLORS[3] : COLORS[4]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender Preference Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gender Preferences</CardTitle>
            <CardDescription>Job gender preferences distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  value: { label: "Jobs", color: "hsl(var(--chart-5))" },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderPreferenceData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      onClick={(data: { name: string }) => handleChartClick("genderPreference", data.name)}
                      style={{ cursor: "pointer" }}
                      maxBarSize={80}
                    >
                      {genderPreferenceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedChartData.genderPreference?.includes(entry.name) ? COLORS[0] : COLORS[1]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Jobs Table</CardTitle>
              <CardDescription>Detailed view of all job listings</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Global search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={exportToCSV} className="flex items-center gap-2 whitespace-nowrap">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("title")}
                      >
                        Title {sortConfig?.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search titles..."
                        value={columnSearches.title || ""}
                        onChange={(e) => handleColumnSearch("title", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("companyName")}
                      >
                        Company {sortConfig?.key === "companyName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search companies..."
                        value={columnSearches.companyName || ""}
                        onChange={(e) => handleColumnSearch("companyName", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("domainType")}
                      >
                        Domain {sortConfig?.key === "domainType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search domain..."
                        value={columnSearches.domainType || ""}
                        onChange={(e) => handleColumnSearch("domainType", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("contractType")}
                      >
                        Type {sortConfig?.key === "contractType" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search type..."
                        value={columnSearches.contractType || ""}
                        onChange={(e) => handleColumnSearch("contractType", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("experienceLevel")}
                      >
                        Experience{" "}
                        {sortConfig?.key === "experienceLevel" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search experience..."
                        value={columnSearches.experienceLevel || ""}
                        onChange={(e) => handleColumnSearch("experienceLevel", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("salaryRange")}
                      >
                        Salary {sortConfig?.key === "salaryRange" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search salary..."
                        value={columnSearches.salaryRange || ""}
                        onChange={(e) => handleColumnSearch("salaryRange", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <div className="space-y-2">
                      <div
                        className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1"
                        onClick={() => handleSort("stateName")}
                      >
                        Location {sortConfig?.key === "stateName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </div>
                      <Input
                        placeholder="Search location..."
                        value={columnSearches.stateName || ""}
                        onChange={(e) => handleColumnSearch("stateName", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <div className="space-y-2">
                      <div className="p-1">Remote</div>
                      <Input
                        placeholder="yes/no"
                        value={columnSearches.jobType || ""}
                        onChange={(e) => handleColumnSearch("jobType", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <div className="space-y-2">
                      <div className="p-1">Disability Friendly</div>
                      <Input
                        placeholder="yes/no"
                        value={columnSearches.isDisabilityAllowed || ""}
                        onChange={(e) => handleColumnSearch("isDisabilityAllowed", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="default">{job.domainType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.contractType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{job.experienceLevel}</Badge>
                    </TableCell>
                    <TableCell>{job.salaryRange || "Not specified"}</TableCell>
                    <TableCell>{job.stateName || "Not specified"}</TableCell>
                    <TableCell>
                      <Badge variant={job.jobType === "Remote" ? "default" : "outline"}>{job.jobType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={job.isDisabilityAllowed ? "default" : "outline"}>
                        {job.isDisabilityAllowed ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No jobs found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
