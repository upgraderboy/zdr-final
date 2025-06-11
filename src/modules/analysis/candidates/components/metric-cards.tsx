"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, GraduationCap, MapPin } from "lucide-react"
import type { ResumeServerData } from "../../../../../types/globals"

interface MetricCardsProps {
  data: ResumeServerData[]
}

export function MetricCards({ data }: MetricCardsProps) {



  const metrics = [
    {
      title: "Total Candidates",
      value: data.length,
      icon: Users,
      description: "Active candidates",
    },
    {
      title: "Tech Professionals",
      value: data.filter((item) => item.skillType === "TECH").length,
      icon: Briefcase,
      description: "Technology focused",
    },
    {
      title: "Senior Level",
      value: data.filter((item) => item.experienceLevel === "Senior Level").length,
      icon: GraduationCap,
      description: "Experienced professionals",
    },
    {
      title: "Unique Locations",
      value: new Set(data.map((item) => `${item.city}, ${item.country}`)).size,
      icon: MapPin,
      description: "Cities represented",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}



