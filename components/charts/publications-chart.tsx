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

interface Publication {
  year: number
  count: number
  facultyIds: number[]
  type: string
  indexing?: string
}

interface PublicationsChartProps {
  data: Publication[]
  publicationType: string
  indexingType: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function PublicationsChart({ data, publicationType, indexingType }: PublicationsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Filter data based on publication type and indexing
  let filteredData = data

  if (publicationType !== "all") {
    filteredData = data.filter((item) => item.type === publicationType)

    // If journal is selected and indexing is specified
    if (publicationType === "journal" && indexingType !== "all") {
      filteredData = filteredData.filter((item) => item.indexing === indexingType)
    }
  }

  // Aggregate data by year and publication type or indexing
  const aggregatedData = filteredData.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.year === item.year)

    if (existingItem) {
      // If we're showing journal with indexing
      if (publicationType === "journal" && indexingType === "all") {
        if (item.indexing === "sci") {
          existingItem.sci += item.count
        } else if (item.indexing === "scopus") {
          existingItem.scopus += item.count
        } else if (item.indexing === "esci") {
          existingItem.esci += item.count
        } else if (item.indexing === "other") {
          existingItem.other += item.count
        }
      }
      // If we're showing all publication types
      else if (publicationType === "all") {
        if (item.type === "journal") {
          existingItem.journal += item.count
        } else if (item.type === "conference") {
          existingItem.conference += item.count
        } else if (item.type === "book") {
          existingItem.book += item.count
        } else if (item.type === "bookChapter") {
          existingItem.bookChapter += item.count
        }
      }
      // If we're showing a specific publication type or journal indexing
      else {
        existingItem.count += item.count
      }

      existingItem.total += item.count
    } else {
      // Create a new entry with default values
      const newItem: any = {
        year: item.year,
        journal: 0,
        conference: 0,
        book: 0,
        bookChapter: 0,
        sci: 0,
        scopus: 0,
        esci: 0,
        other: 0,
        count: 0,
        total: item.count,
      }

      // Set the appropriate value based on the type or indexing
      if (publicationType === "journal" && indexingType === "all") {
        if (item.indexing === "sci") {
          newItem.sci = item.count
        } else if (item.indexing === "scopus") {
          newItem.scopus = item.count
        } else if (item.indexing === "esci") {
          newItem.esci = item.count
        } else if (item.indexing === "other") {
          newItem.other = item.count
        }
      } else if (publicationType === "all") {
        if (item.type === "journal") {
          newItem.journal = item.count
        } else if (item.type === "conference") {
          newItem.conference = item.count
        } else if (item.type === "book") {
          newItem.book = item.count
        } else if (item.type === "bookChapter") {
          newItem.bookChapter = item.count
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

  if (publicationType === "journal" && indexingType === "all") {
    pieData = [
      {
        name: "SCI(E)",
        value: filteredData.filter((item) => item.indexing === "sci").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Scopus",
        value: filteredData.filter((item) => item.indexing === "scopus").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "ESCI",
        value: filteredData.filter((item) => item.indexing === "esci").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Other",
        value: filteredData.filter((item) => item.indexing === "other").reduce((sum, item) => sum + item.count, 0),
      },
    ]
  } else if (publicationType === "all") {
    pieData = [
      {
        name: "Journal",
        value: filteredData.filter((item) => item.type === "journal").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Conference",
        value: filteredData.filter((item) => item.type === "conference").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Book",
        value: filteredData.filter((item) => item.type === "book").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Book Chapter",
        value: filteredData.filter((item) => item.type === "bookChapter").reduce((sum, item) => sum + item.count, 0),
      },
    ]
  } else {
    // For specific publication type or indexing
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
    if (publicationType === "journal" && indexingType === "all") {
      return [
        { dataKey: "sci", name: "SCI(E)", color: "#e76e50" },
        { dataKey: "scopus", name: "Scopus", color: "#2a9d90" },
        { dataKey: "esci", name: "ESCI", color: "#274754" },
        { dataKey: "other", name: "Other", color: "#e8c468" },
      ]
    } else if (publicationType === "all") {
      return [
        { dataKey: "journal", name: "Journal", color: "#e76e50" },
        { dataKey: "conference", name: "Conference", color: "#2a9d90" },
        { dataKey: "book", name: "Book", color: "#274754" },
        { dataKey: "bookChapter", name: "Book Chapter", color: "#e8c468" },
      ]
    } else {
      return [{ dataKey: "count", name: publicationType, color: "#e76e50" }]
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
              {barDataKeys.map((item, index) => (
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
