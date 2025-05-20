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

// Define colors for different event types
const EVENT_COLORS = {
  conference: "#845EC2",
  stc: "#D65DB1",
  workshop: "#FF6F91",
  gian: "#FF9671",
  all: "#000000",
}

export default function EventsChart({ data, eventType }: EventsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line")

  // Determine if we should show all event types or just one
  const shouldShowAllTypes = eventType === "all"

  // Aggregate data by year and event type
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (item.type === "conference") {
          existingItem.conference += item.count
        } else if (item.type === "stc") {
          existingItem.stc += item.count
        } else if (item.type === "workshop") {
          existingItem.workshop += item.count
        } else if (item.type === "gian") {
          existingItem.gian += item.count
        }
        existingItem.total += item.count
      } else {
        acc.push({
          year: item.year,
          conference: item.type === "conference" ? item.count : 0,
          stc: item.type === "stc" ? item.count : 0,
          workshop: item.type === "workshop" ? item.count : 0,
          gian: item.type === "gian" ? item.count : 0,
          total: item.count,
        })
      }
      return acc
    },
    [] as {
      year: number
      conference: number
      stc: number
      workshop: number
      gian: number
      total: number
    }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart data
  let pieData = []

  if (shouldShowAllTypes) {
    // When showing all types, create pie data with all event types
    pieData = [
      {
        name: "Conference",
        value: data.filter((item) => item.type === "conference").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "STC/E-STC",
        value: data.filter((item) => item.type === "stc").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Workshop/FDP",
        value: data.filter((item) => item.type === "workshop").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "GIAN",
        value: data.filter((item) => item.type === "gian").reduce((sum, item) => sum + item.count, 0),
      },
    ]
  } else {
    // When showing a specific type, create pie data by year
    const yearData = {}
    aggregatedData.forEach((item) => {
      let typeValue = 0
      if (eventType === "conference") typeValue = item.conference
      else if (eventType === "stc") typeValue = item.stc
      else if (eventType === "workshop") typeValue = item.workshop
      else if (eventType === "gian") typeValue = item.gian

      if (typeValue > 0) {
        yearData[item.year] = (yearData[item.year] || 0) + typeValue
      }
    })

    Object.entries(yearData).forEach(([year, value]) => {
      pieData.push({
        name: year,
        value,
      })
    })
  }

  // Filter out zero values from pieData
  pieData = pieData.filter((item) => item.value > 0)

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }

  // Get event type title
  const getEventTypeTitle = () => {
    switch (eventType) {
      case "conference":
        return "Conference Events"
      case "stc":
        return "STC/E-STC Events"
      case "workshop":
        return "Workshop/FDP Events"
      case "gian":
        return "GIAN Events"
      default:
        return "All Events"
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 text-gray-700">{getEventTypeTitle()}</h3>
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

              {shouldShowAllTypes ? (
                // Show all event types
                <>
                  <Bar
                    dataKey="conference"
                    name="Conference"
                    fill={EVENT_COLORS.conference}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  >
                    <LabelList dataKey="conference" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="stc" name="STC/E-STC" fill={EVENT_COLORS.stc} radius={[4, 4, 0, 0]} barSize={12}>
                    <LabelList dataKey="stc" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar
                    dataKey="workshop"
                    name="Workshop/FDP"
                    fill={EVENT_COLORS.workshop}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  >
                    <LabelList dataKey="workshop" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="gian" name="GIAN" fill={EVENT_COLORS.gian} radius={[4, 4, 0, 0]} barSize={12}>
                    <LabelList dataKey="gian" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                </>
              ) : // Show only the selected event type
              eventType === "conference" ? (
                <Bar
                  dataKey="conference"
                  name="Conference"
                  fill={EVENT_COLORS.conference}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList dataKey="conference" position="center" fill="#fff" />
                </Bar>
              ) : eventType === "stc" ? (
                <Bar dataKey="stc" name="STC/E-STC" fill={EVENT_COLORS.stc} radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="stc" position="center" fill="#fff" />
                </Bar>
              ) : eventType === "workshop" ? (
                <Bar
                  dataKey="workshop"
                  name="Workshop/FDP"
                  fill={EVENT_COLORS.workshop}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                >
                  <LabelList dataKey="workshop" position="center" fill="#fff" />
                </Bar>
              ) : (
                <Bar dataKey="gian" name="GIAN" fill={EVENT_COLORS.gian} radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="gian" position="center" fill="#fff" />
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
                  if (shouldShowAllTypes) {
                    // Use event colors
                    if (entry.name === "Conference") color = EVENT_COLORS.conference
                    else if (entry.name === "STC/E-STC") color = EVENT_COLORS.stc
                    else if (entry.name === "Workshop/FDP") color = EVENT_COLORS.workshop
                    else if (entry.name === "GIAN") color = EVENT_COLORS.gian
                  } else {
                    // Use a single color based on event type
                    color = EVENT_COLORS[eventType]
                  }
                  return <Cell key={`cell-${index}`} fill={color} />
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

              {shouldShowAllTypes ? (
                // Show all event types
                <>
                  <Line
                    type="monotone"
                    dataKey="conference"
                    name="Conference"
                    stroke={EVENT_COLORS.conference}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stc"
                    name="STC/E-STC"
                    stroke={EVENT_COLORS.stc}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workshop"
                    name="Workshop/FDP"
                    stroke={EVENT_COLORS.workshop}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gian"
                    name="GIAN"
                    stroke={EVENT_COLORS.gian}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : // Show only the selected event type
              eventType === "conference" ? (
                <Line
                  type="monotone"
                  dataKey="conference"
                  name="Conference"
                  stroke={EVENT_COLORS.conference}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : eventType === "stc" ? (
                <Line
                  type="monotone"
                  dataKey="stc"
                  name="STC/E-STC"
                  stroke={EVENT_COLORS.stc}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : eventType === "workshop" ? (
                <Line
                  type="monotone"
                  dataKey="workshop"
                  name="Workshop/FDP"
                  stroke={EVENT_COLORS.workshop}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="gian"
                  name="GIAN"
                  stroke={EVENT_COLORS.gian}
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
