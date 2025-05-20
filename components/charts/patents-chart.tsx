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

interface Patent {
  year: number
  status: string
  id: number
  facultyIds: number[]
}

interface PatentsChartProps {
  data: Patent[]
  patentStatus: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

// Define colors for patent statuses
const STATUS_COLORS = {
  filed: "#e8c468",
  granted: "#f4a462",
}

export default function PatentsChart({ data, patentStatus }: PatentsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Determine if we should show all statuses or just one
  const shouldShowAllStatuses = patentStatus === "all"

  // Aggregate data by year
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (item.status === "filed") {
          existingItem.filed += 1
        } else if (item.status === "granted") {
          existingItem.granted += 1
        }
      } else {
        acc.push({
          year: item.year,
          filed: item.status === "filed" ? 1 : 0,
          granted: item.status === "granted" ? 1 : 0,
        })
      }
      return acc
    },
    [] as { year: number; filed: number; granted: number }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, create appropriate data structure
  const pieData = shouldShowAllStatuses
    ? [
        { name: "Filed", value: data.filter((item) => item.status === "filed").length },
        { name: "Granted", value: data.filter((item) => item.status === "granted").length },
      ]
    : aggregatedData
        .map((item) => ({
          name: item.year.toString(),
          value: patentStatus === "filed" ? item.filed : item.granted,
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

  // Get patent status title
  const getPatentStatusTitle = () => {
    switch (patentStatus) {
      case "filed":
        return "Filed Patents"
      case "granted":
        return "Granted Patents"
      default:
        return "All Patents"
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 text-gray-700">{getPatentStatusTitle()}</h3>
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
                // Show all patent statuses
                <>
                  <Bar dataKey="filed" name="Filed" fill={STATUS_COLORS.filed} radius={[4, 4, 0, 0]} barSize={20}>
                    <LabelList dataKey="filed" position="center" fill="#fff" />
                  </Bar>
                  <Bar dataKey="granted" name="Granted" fill={STATUS_COLORS.granted} radius={[4, 4, 0, 0]} barSize={20}>
                    <LabelList dataKey="granted" position="center" fill="#fff" />
                  </Bar>
                </>
              ) : // Show only the selected status
              patentStatus === "filed" ? (
                <Bar dataKey="filed" name="Filed" fill={STATUS_COLORS.filed} radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="filed" position="center" fill="#fff" />
                </Bar>
              ) : (
                <Bar dataKey="granted" name="Granted" fill={STATUS_COLORS.granted} radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="granted" position="center" fill="#fff" />
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
                    if (entry.name === "Filed") color = STATUS_COLORS.filed
                    else if (entry.name === "Granted") color = STATUS_COLORS.granted
                  } else {
                    // Use a single color based on status
                    color = STATUS_COLORS[patentStatus]
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
                // Show all patent statuses
                <>
                  <Line
                    type="monotone"
                    dataKey="filed"
                    name="Filed"
                    stroke={STATUS_COLORS.filed}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="granted"
                    name="Granted"
                    stroke={STATUS_COLORS.granted}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : // Show only the selected status
              patentStatus === "filed" ? (
                <Line
                  type="monotone"
                  dataKey="filed"
                  name="Filed"
                  stroke={STATUS_COLORS.filed}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="granted"
                  name="Granted"
                  stroke={STATUS_COLORS.granted}
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
