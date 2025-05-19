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

interface Event {
  year: number
  count: number
  facultyIds: number[]
  type: string
}

interface EventsChartProps {
  data: Event[]
  eventType: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function EventsChart({ data, eventType }: EventsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line")

  // Filter data based on event type
  let filteredData = data
  if (eventType !== "all") {
    filteredData = data.filter((item) => item.type === eventType)
  }

  // Aggregate data by year and event type
  const aggregatedData = filteredData.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.year === item.year)

    if (existingItem) {
      if (eventType === "all") {
        if (item.type === "conference") {
          existingItem.conference += item.count
        } else if (item.type === "stc") {
          existingItem.stc += item.count
        } else if (item.type === "workshop") {
          existingItem.workshop += item.count
        } else if (item.type === "gian") {
          existingItem.gian += item.count
        }
      } else {
        existingItem.count += item.count
      }

      existingItem.total += item.count
    } else {
      // Create a new entry with default values
      const newItem: any = {
        year: item.year,
        conference: 0,
        stc: 0,
        workshop: 0,
        gian: 0,
        count: 0,
        total: item.count,
      }

      // Set the appropriate value based on the type
      if (eventType === "all") {
        if (item.type === "conference") {
          newItem.conference = item.count
        } else if (item.type === "stc") {
          newItem.stc = item.count
        } else if (item.type === "workshop") {
          newItem.workshop = item.count
        } else if (item.type === "gian") {
          newItem.gian = item.count
        }
      } else {
        newItem.count = item.count
      }

      acc.push(newItem)
    }
    return acc
  }, [] as any[])

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need to transform the data
  let pieData = []

  if (eventType === "all") {
    pieData = [
      {
        name: "Conference",
        value: filteredData.filter((item) => item.type === "conference").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "STC/E-STC",
        value: filteredData.filter((item) => item.type === "stc").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Workshop/FDP",
        value: filteredData.filter((item) => item.type === "workshop").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "GIAN",
        value: filteredData.filter((item) => item.type === "gian").reduce((sum, item) => sum + item.count, 0),
      },
    ]
  } else {
    // For specific event type
    pieData = aggregatedData.map((item) => ({
      name: `${item.year}`,
      value: item.count || item.total,
    }))
  }

  // If no data, show a message
  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }

  // Determine which data keys to show based on filters
  const getBarDataKeys = () => {
    if (eventType === "all") {
      return [
        { dataKey: "conference", name: "Conference", color: "#e76e50" },
        { dataKey: "stc", name: "STC/E-STC", color: "#2a9d90" },
        { dataKey: "workshop", name: "Workshop/FDP", color: "#274754" },
        { dataKey: "gian", name: "GIAN", color: "#e8c468" },
      ]
    } else {
      return [{ dataKey: "count", name: eventType, color: "#e76e50" }]
    }
  }

  const barDataKeys = getBarDataKeys()

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
              {barDataKeys.map((item) => (
                <Bar
                  key={item.dataKey}
                  dataKey={item.dataKey}
                  name={item.name}
                  fill={item.color}
                  radius={[4, 4, 0, 0]}
                  barSize={15}
                >
                  <LabelList dataKey={item.dataKey} position="center" fill="#fff" fontSize={10} />
                </Bar>
              ))}
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
              {barDataKeys.map((item) => (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  name={item.name}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
