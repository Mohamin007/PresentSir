"use client"

import { Download, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { departmentHeatmap, adminAiInsights } from "@/lib/data"
import { cn } from "@/lib/utils"

const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

function getHeatmapColor(value: number) {
  if (value >= 88) return "bg-green-500"
  if (value >= 83) return "bg-green-400"
  if (value >= 80) return "bg-yellow-400"
  if (value >= 77) return "bg-orange-400"
  return "bg-red-400"
}

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Organisation-wide attendance analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Heatmap by Department</CardTitle>
          <CardDescription>Weekly attendance rates across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-4 pr-4">Department</th>
                  {weeks.map((week) => (
                    <th key={week} className="text-center text-sm font-medium text-muted-foreground pb-4 px-2 min-w-20">
                      {week}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departmentHeatmap.map((row) => (
                  <tr key={row.department}>
                    <td className="py-2 pr-4 text-sm font-medium text-foreground">{row.department}</td>
                    <td className="py-2 px-2">
                      <div className={cn("rounded-md py-3 text-center text-sm font-medium text-white", getHeatmapColor(row.week1))}>
                        {row.week1}%
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className={cn("rounded-md py-3 text-center text-sm font-medium text-white", getHeatmapColor(row.week2))}>
                        {row.week2}%
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className={cn("rounded-md py-3 text-center text-sm font-medium text-white", getHeatmapColor(row.week3))}>
                        {row.week3}%
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className={cn("rounded-md py-3 text-center text-sm font-medium text-white", getHeatmapColor(row.week4))}>
                        {row.week4}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">88%+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-400" />
              <span className="text-xs text-muted-foreground">83-87%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <span className="text-xs text-muted-foreground">80-82%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-400" />
              <span className="text-xs text-muted-foreground">77-79%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400" />
              <span className="text-xs text-muted-foreground">&lt;77%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Automated analysis of attendance trends</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">{adminAiInsights.summary}</p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Key Observations:</p>
            <ul className="space-y-2">
              {adminAiInsights.trends.map((trend, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {trend}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
