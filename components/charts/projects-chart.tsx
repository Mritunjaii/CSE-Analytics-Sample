"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { type ChartType, ChartTypeSelector } from "../chart-type-selector"

interface Project {
  year: number
  status: string
  id: number
  facultyIds: number[]
  funding: number
}

interface ProjectsChartProps {
  data: Project[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function ProjectsChart({ data }: ProjectsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Aggregate data by year
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (item.status === "ongoing") {
          existingItem.ongoing += 1
          existingItem.ongoingFunding += item.funding
        } else if (item.status === "completed") {
          existingItem.completed += 1
          existingItem.completedFunding += item.funding
        }
        existingItem.totalFunding += item.funding
      } else {
        acc.push({
          year: item.year,
          ongoing: item.status === "ongoing" ? 1 : 0,
          completed: item.status === "completed" ? 1 : 0,
          ongoingFunding: item.status === "ongoing" ? item.funding : 0,
          completedFunding: item.status === "completed" ? item.funding : 0,
          totalFunding: item.funding,
        })
      }
      return acc
    },
    [] as {
      year: number
      ongoing: number
      completed: number
      ongoingFunding: number
      completedFunding: number
      totalFunding: number
    }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need different data structure
  const pieData = [
    { name: "Ongoing", value: data.filter((item) => item.status === "ongoing").length },
    { name: "Completed", value: data.filter((item) => item.status === "completed").length },
  ]

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }

  return (
    <div>
      <ChartTypeSelector value={chartType} onValueChange={setChartType} />
      <div className="h-[300px] w-full">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={aggregatedData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="ongoing" name="Ongoing" fill="#2a9d90" radius={[4, 4, 0, 0]} barSize={20}>
                <LabelList dataKey="ongoing" position="center" fill="#fff" />
              </Bar>
              <Bar dataKey="completed" name="Completed" fill="#274754" radius={[4, 4, 0, 0]} barSize={20}>
                <LabelList dataKey="completed" position="center" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={aggregatedData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ongoing"
                name="Ongoing"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#274754"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
