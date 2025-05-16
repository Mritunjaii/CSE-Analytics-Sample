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
}

interface PublicationsChartProps {
  data: Publication[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function PublicationsChart({ data }: PublicationsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Aggregate data by year and publication type
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (item.type === "journal") {
          existingItem.journal += item.count
        } else if (item.type === "conference") {
          existingItem.conference += item.count
        } else if (item.type === "book") {
          existingItem.book += item.count
        } else if (item.type === "bookChapter") {
          existingItem.bookChapter += item.count
        }
        existingItem.total += item.count
      } else {
        acc.push({
          year: item.year,
          journal: item.type === "journal" ? item.count : 0,
          conference: item.type === "conference" ? item.count : 0,
          book: item.type === "book" ? item.count : 0,
          bookChapter: item.type === "bookChapter" ? item.count : 0,
          total: item.count,
        })
      }
      return acc
    },
    [] as {
      year: number
      journal: number
      conference: number
      book: number
      bookChapter: number
      total: number
    }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need to transform the data
  const pieData = [
    {
      name: "Journal",
      value: data.filter((item) => item.type === "journal").reduce((sum, item) => sum + item.count, 0),
    },
    {
      name: "Conference",
      value: data.filter((item) => item.type === "conference").reduce((sum, item) => sum + item.count, 0),
    },
    {
      name: "Book",
      value: data.filter((item) => item.type === "book").reduce((sum, item) => sum + item.count, 0),
    },
    {
      name: "Book Chapter",
      value: data.filter((item) => item.type === "bookChapter").reduce((sum, item) => sum + item.count, 0),
    },
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
              <Bar dataKey="journal" name="Journal" fill="#e76e50" radius={[4, 4, 0, 0]} barSize={15}>
                <LabelList dataKey="journal" position="center" fill="#fff" fontSize={10} />
              </Bar>
              <Bar dataKey="conference" name="Conference" fill="#2a9d90" radius={[4, 4, 0, 0]} barSize={15}>
                <LabelList dataKey="conference" position="center" fill="#fff" fontSize={10} />
              </Bar>
              <Bar dataKey="book" name="Book" fill="#274754" radius={[4, 4, 0, 0]} barSize={15}>
                <LabelList dataKey="book" position="center" fill="#fff" fontSize={10} />
              </Bar>
              <Bar dataKey="bookChapter" name="Book Chapter" fill="#e8c468" radius={[4, 4, 0, 0]} barSize={15}>
                <LabelList dataKey="bookChapter" position="center" fill="#fff" fontSize={10} />
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
                dataKey="journal"
                name="Journal"
                stroke="#e76e50"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="conference"
                name="Conference"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="book"
                name="Book"
                stroke="#274754"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bookChapter"
                name="Book Chapter"
                stroke="#e8c468"
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
