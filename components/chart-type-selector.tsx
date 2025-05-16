"use client"

import { BarChart3, PieChart, LineChart } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ChartType = "bar" | "pie" | "line"

interface ChartTypeSelectorProps {
  value: ChartType
  onValueChange: (value: ChartType) => void
}

export function ChartTypeSelector({ value, onValueChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center justify-end mb-2">
      <span className="text-sm text-gray-500 mr-2">Chart Type:</span>
      <ToggleGroup type="single" value={value} onValueChange={(value) => value && onValueChange(value as ChartType)}>
        <ToggleGroupItem value="bar" aria-label="Bar Chart" title="Bar Chart">
          <BarChart3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="pie" aria-label="Pie Chart" title="Pie Chart">
          <PieChart className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="line" aria-label="Line Chart" title="Line Chart">
          <LineChart className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
