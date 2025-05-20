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

interface Publication {
  year: number
  count: number
  facultyIds: number[]
  type: string
  indexing: string
}

interface PublicationsChartProps {
  data: Publication[]
  publicationType: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

// Define colors for different types of publications
const TYPE_COLORS = {
  journal: "#e76e50",
  conference: "#2a9d90",
  book: "#274754",
  bookChapter: "#e8c468",
}

// Define colors for different indexing types
const INDEXING_COLORS = {
  sci: "#4287f5",
  scopus: "#42f5a7",
  esci: "#f542a1",
  other: "#f5d442",
}

export default function PublicationsChart({ data, publicationType }: PublicationsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Determine if we should aggregate by type or by indexing
  const shouldShowByType = publicationType === "all"
  const shouldShowByIndexing = publicationType !== "all"

  // Aggregate data by year and publication type or indexing
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (shouldShowByType) {
          // Aggregate by publication type when showing all types
          if (item.type === "journal") {
            existingItem.journal += item.count
          } else if (item.type === "conference") {
            existingItem.conference += item.count
          } else if (item.type === "book") {
            existingItem.book += item.count
          } else if (item.type === "bookChapter") {
            existingItem.bookChapter += item.count
          }
        } else {
          // Aggregate by indexing when a specific type is selected
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
        existingItem.total += item.count
      } else {
        if (shouldShowByType) {
          acc.push({
            year: item.year,
            journal: item.type === "journal" ? item.count : 0,
            conference: item.type === "conference" ? item.count : 0,
            book: item.type === "book" ? item.count : 0,
            bookChapter: item.type === "bookChapter" ? item.count : 0,
            total: item.count,
            // Add zero values for indexing to avoid errors
            sci: 0,
            scopus: 0,
            esci: 0,
            other: 0,
          })
        } else {
          acc.push({
            year: item.year,
            sci: item.indexing === "sci" ? item.count : 0,
            scopus: item.indexing === "scopus" ? item.count : 0,
            esci: item.indexing === "esci" ? item.count : 0,
            other: item.indexing === "other" ? item.count : 0,
            total: item.count,
            // Add zero values for types to avoid errors
            journal: 0,
            conference: 0,
            book: 0,
            bookChapter: 0,
          })
        }
      }
      return acc
    },
    [] as {
      year: number
      journal: number
      conference: number
      book: number
      bookChapter: number
      sci: number
      scopus: number
      esci: number
      other: number
      total: number
    }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need to transform the data based on what we're showing
  let pieData = []

  if (shouldShowByType) {
    pieData = [
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
  } else {
    pieData = [
      {
        name: "SCI(E)",
        value: data.filter((item) => item.indexing === "sci").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Scopus",
        value: data.filter((item) => item.indexing === "scopus").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "ESCI",
        value: data.filter((item) => item.indexing === "esci").reduce((sum, item) => sum + item.count, 0),
      },
      {
        name: "Other",
        value: data.filter((item) => item.indexing === "other").reduce((sum, item) => sum + item.count, 0),
      },
    ]
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

  // Get publication type title
  const getPublicationTypeTitle = () => {
    switch (publicationType) {
      case "journal":
        return "Journal Publications"
      case "conference":
        return "Conference Publications"
      case "book":
        return "Book Publications"
      case "bookChapter":
        return "Book Chapter Publications"
      default:
        return "All Publications"
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 text-gray-700">{getPublicationTypeTitle()}</h3>
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

              {shouldShowByType ? (
                // Show publication types
                <>
                  <Bar dataKey="journal" name="Journal" fill={TYPE_COLORS.journal} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="journal" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar
                    dataKey="conference"
                    name="Conference"
                    fill={TYPE_COLORS.conference}
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  >
                    <LabelList dataKey="conference" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="book" name="Book" fill={TYPE_COLORS.book} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="book" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar
                    dataKey="bookChapter"
                    name="Book Chapter"
                    fill={TYPE_COLORS.bookChapter}
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  >
                    <LabelList dataKey="bookChapter" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                </>
              ) : (
                // Show indexing types for the selected publication type
                <>
                  <Bar dataKey="sci" name="SCI(E)" fill={INDEXING_COLORS.sci} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="sci" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="scopus" name="Scopus" fill={INDEXING_COLORS.scopus} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="scopus" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="esci" name="ESCI" fill={INDEXING_COLORS.esci} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="esci" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                  <Bar dataKey="other" name="Other" fill={INDEXING_COLORS.other} radius={[4, 4, 0, 0]} barSize={15}>
                    <LabelList dataKey="other" position="center" fill="#fff" fontSize={10} />
                  </Bar>
                </>
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
                  if (shouldShowByType) {
                    // Use type colors
                    if (entry.name === "Journal") color = TYPE_COLORS.journal
                    else if (entry.name === "Conference") color = TYPE_COLORS.conference
                    else if (entry.name === "Book") color = TYPE_COLORS.book
                    else if (entry.name === "Book Chapter") color = TYPE_COLORS.bookChapter
                  } else {
                    // Use indexing colors
                    if (entry.name === "SCI(E)") color = INDEXING_COLORS.sci
                    else if (entry.name === "Scopus") color = INDEXING_COLORS.scopus
                    else if (entry.name === "ESCI") color = INDEXING_COLORS.esci
                    else if (entry.name === "Other") color = INDEXING_COLORS.other
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

              {shouldShowByType ? (
                // Show publication types
                <>
                  <Line
                    type="monotone"
                    dataKey="journal"
                    name="Journal"
                    stroke={TYPE_COLORS.journal}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conference"
                    name="Conference"
                    stroke={TYPE_COLORS.conference}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="book"
                    name="Book"
                    stroke={TYPE_COLORS.book}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookChapter"
                    name="Book Chapter"
                    stroke={TYPE_COLORS.bookChapter}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                // Show indexing types for the selected publication type
                <>
                  <Line
                    type="monotone"
                    dataKey="sci"
                    name="SCI(E)"
                    stroke={INDEXING_COLORS.sci}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scopus"
                    name="Scopus"
                    stroke={INDEXING_COLORS.scopus}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="esci"
                    name="ESCI"
                    stroke={INDEXING_COLORS.esci}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="other"
                    name="Other"
                    stroke={INDEXING_COLORS.other}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
