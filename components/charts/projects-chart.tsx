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
  Tooltip,
} from "recharts"
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
  projectStatus: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

// Define colors for project statuses
const STATUS_COLORS = {
  ongoing: "#2a9d90",
  completed: "#274754",
}

export default function ProjectsChart({ data, projectStatus }: ProjectsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Determine if we should show all statuses or just one
  const shouldShowAllStatuses = projectStatus === "all"

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
  const pieData = shouldShowAllStatuses
    ? [
        { name: "Ongoing", value: data.filter((item) => item.status === "ongoing").length },
        { name: "Completed", value: data.filter((item) => item.status === "completed").length },
      ]
    : aggregatedData
        .map((item) => ({
          name: item.year.toString(),
          value: projectStatus === "ongoing" ? item.ongoing : item.completed,
        }))
        .filter((item) => item.value > 0)

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }

  // Get project status title
  const getProjectStatusTitle = () => {
    switch (projectStatus) {
      case "ongoing":
        return "Ongoing Consultancies/Research Projects"
      case "completed":
        return "Completed Consultancies/Research Projects"
      default:
        return "All Consultancies/Research Projects"
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 text-gray-700">{getProjectStatusTitle()}</h3>
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
              <Tooltip />
              <Legend />

              {shouldShowAllStatuses ? (
                // Show all project statuses
                <>
                  <Bar dataKey="ongoing" name="Ongoing" fill={STATUS_COLORS.ongoing} radius={[4, 4, 0, 0]} barSize={20}>
                    <LabelList dataKey="ongoing" position="center" fill="#fff" />
                  </Bar>
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill={STATUS_COLORS.completed}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  >
                    <LabelList dataKey="completed" position="center" fill="#fff" />
                  </Bar>
                </>
              ) : // Show only the selected status
              projectStatus === "ongoing" ? (
                <Bar dataKey="ongoing" name="Ongoing" fill={STATUS_COLORS.ongoing} radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="ongoing" position="center" fill="#fff" />
                </Bar>
              ) : (
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill={STATUS_COLORS.completed}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList dataKey="completed" position="center" fill="#fff" />
                </Bar>
              )}
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
                {pieData.map((entry, index) => {
                  let color
                  if (shouldShowAllStatuses) {
                    // Use status colors
                    if (entry.name === "Ongoing") color = STATUS_COLORS.ongoing
                    else if (entry.name === "Completed") color = STATUS_COLORS.completed
                  } else {
                    // Use a single color based on status
                    color = STATUS_COLORS[projectStatus]
                  }
                  return <Cell key={`cell-${index}`} fill={color || COLORS[index % COLORS.length]} />
                })}
              </Pie>
              <Legend />
              <Tooltip />
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
              <Tooltip />
              <Legend />

              {shouldShowAllStatuses ? (
                // Show all project statuses
                <>
                  <Line
                    type="monotone"
                    dataKey="ongoing"
                    name="Ongoing"
                    stroke={STATUS_COLORS.ongoing}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke={STATUS_COLORS.completed}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : // Show only the selected status
              projectStatus === "ongoing" ? (
                <Line
                  type="monotone"
                  dataKey="ongoing"
                  name="Ongoing"
                  stroke={STATUS_COLORS.ongoing}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke={STATUS_COLORS.completed}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
