"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PublicationsChart from "./charts/publications-chart"
import ProjectsChart from "./charts/projects-chart"
import PatentsChart from "./charts/patents-chart"
import EventsChart from "./charts/events-chart"
import { FacultyFilter } from "./faculty-filter"
import { FundingFilter } from "./funding-filter"
import { publicationsData, projectsData, patentsData, eventsData, facultyData } from "@/data/mock-data"

// Get all available years from the data
const allYears = Array.from(
  new Set([
    ...publicationsData.map((item) => item.year),
    ...projectsData.map((item) => item.year),
    ...patentsData.map((item) => item.year),
    ...eventsData.map((item) => item.year),
  ]),
).sort((a, b) => a - b)

const minYear = Math.min(...allYears)
const maxYear = Math.max(...allYears)

// Calculate default start year (last 5 years)
const defaultStartYear = Math.max(minYear, maxYear - 4)

export default function Dashboard() {
  const [startYear, setStartYear] = useState(defaultStartYear)
  const [endYear, setEndYear] = useState(maxYear)
  const [projectStatus, setProjectStatus] = useState("all")
  const [patentStatus, setPatentStatus] = useState("all")
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null)
  const [publicationType, setPublicationType] = useState("all")
  const [publicationIndexing, setPublicationIndexing] = useState("all")
  const [eventType, setEventType] = useState("all")

  // Find min and max funding values for the slider
  const minFunding = Math.min(...projectsData.map((project) => project.funding))
  const maxFunding = Math.max(...projectsData.map((project) => project.funding))
  const [fundingRange, setFundingRange] = useState<[number, number]>([minFunding, maxFunding])

  // Filter data based on selected filters
  const filteredPublications = useMemo(() => {
    return publicationsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      const typeMatch = publicationType === "all" ? true : item.type === publicationType
      const indexingMatch = publicationIndexing === "all" ? true : item.indexing === publicationIndexing
      return yearMatch && facultyMatch && typeMatch && indexingMatch
    })
  }, [startYear, endYear, selectedFaculty, publicationType, publicationIndexing])

  const filteredProjects = useMemo(() => {
    return projectsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const statusMatch = projectStatus === "all" ? true : item.status === projectStatus
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      const fundingMatch = item.funding >= fundingRange[0] && item.funding <= fundingRange[1]
      return yearMatch && statusMatch && facultyMatch && fundingMatch
    })
  }, [startYear, endYear, projectStatus, selectedFaculty, fundingRange])

  const filteredPatents = useMemo(() => {
    return patentsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const statusMatch = patentStatus === "all" ? true : item.status === patentStatus
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      return yearMatch && statusMatch && facultyMatch
    })
  }, [startYear, endYear, patentStatus, selectedFaculty])

  const filteredEvents = useMemo(() => {
    return eventsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      const typeMatch = eventType === "all" ? true : item.type === eventType
      return yearMatch && facultyMatch && typeMatch
    })
  }, [startYear, endYear, selectedFaculty, eventType])

  // Get faculty name for display
  const facultyName = selectedFaculty ? facultyData.find((f) => f.id === selectedFaculty)?.name : "All Faculty"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">CSE Department Analytics Dashboard</h1>

          <div className="grid gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="filters">Basic Filters</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="filters" className="space-y-4 mt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Year Range</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Start Year</label>
                        <Select
                          value={startYear.toString()}
                          onValueChange={(value) => {
                            const year = Number.parseInt(value)
                            setStartYear(year)
                            if (year > endYear) {
                              setEndYear(year)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Start Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {allYears.map((year) => (
                              <SelectItem key={`start-${year}`} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End Year</label>
                        <Select
                          value={endYear.toString()}
                          onValueChange={(value) => {
                            const year = Number.parseInt(value)
                            setEndYear(year)
                            if (year < startYear) {
                              setStartYear(year)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="End Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {allYears.map((year) => (
                              <SelectItem key={`end-${year}`} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Publication Type</h2>
                    <ToggleGroup
                      type="single"
                      value={publicationType}
                      onValueChange={(value) => {
                        if (value) {
                          setPublicationType(value)
                          setPublicationIndexing("all")
                        }
                      }}
                    >
                      <ToggleGroupItem value="all" aria-label="All publications">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="journal" aria-label="Journal publications">
                        Journal
                      </ToggleGroupItem>
                      <ToggleGroupItem value="conference" aria-label="Conference publications">
                        Conf.
                      </ToggleGroupItem>
                      <ToggleGroupItem value="book" aria-label="Book publications">
                        Book
                      </ToggleGroupItem>
                      <ToggleGroupItem value="bookChapter" aria-label="Book chapter publications">
                        Chapter
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {publicationType !== "all" && (
                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
                        Publication Indexing
                      </h2>
                      <ToggleGroup
                        type="single"
                        value={publicationIndexing}
                        onValueChange={(value) => value && setPublicationIndexing(value)}
                      >
                        <ToggleGroupItem value="all" aria-label="All indexing">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="sci" aria-label="SCI(E) indexed">
                          SCI(E)
                        </ToggleGroupItem>
                        <ToggleGroupItem value="scopus" aria-label="Scopus indexed">
                          Scopus
                        </ToggleGroupItem>
                        <ToggleGroupItem value="esci" aria-label="ESCI indexed">
                          ESCI
                        </ToggleGroupItem>
                        <ToggleGroupItem value="other" aria-label="Other indexing">
                          Other
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Project Status</h2>
                    <ToggleGroup
                      type="single"
                      value={projectStatus}
                      onValueChange={(value) => value && setProjectStatus(value)}
                    >
                      <ToggleGroupItem value="all" aria-label="All projects">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="ongoing" aria-label="Ongoing projects">
                        Ongoing
                      </ToggleGroupItem>
                      <ToggleGroupItem value="completed" aria-label="Completed projects">
                        Completed
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Patent Status</h2>
                    <ToggleGroup
                      type="single"
                      value={patentStatus}
                      onValueChange={(value) => value && setPatentStatus(value)}
                    >
                      <ToggleGroupItem value="all" aria-label="All patents">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="filed" aria-label="Filed patents">
                        Filed
                      </ToggleGroupItem>
                      <ToggleGroupItem value="granted" aria-label="Granted patents">
                        Granted
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Event Type</h2>
                    <ToggleGroup
                      type="single"
                      value={eventType}
                      onValueChange={(value) => value && setEventType(value)}
                    >
                      <ToggleGroupItem value="all" aria-label="All events">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="conference" aria-label="Conference events">
                        Conf.
                      </ToggleGroupItem>
                      <ToggleGroupItem value="stc" aria-label="STC/E-STC events">
                        STC
                      </ToggleGroupItem>
                      <ToggleGroupItem value="workshop" aria-label="Workshop/FDP events">
                        W/FDP
                      </ToggleGroupItem>
                      <ToggleGroupItem value="gian" aria-label="GIAN events">
                        GIAN
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Faculty Filter</h2>
                      <FacultyFilter selectedFaculty={selectedFaculty} onSelectFaculty={setSelectedFaculty} />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Project Funding</h2>
                    <FundingFilter
                      fundingRange={fundingRange}
                      onFundingRangeChange={setFundingRange}
                      min={minFunding}
                      max={maxFunding}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Publications` : "Research Publications"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicationsChart data={filteredPublications} publicationType={publicationType} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {selectedFaculty
                  ? `${facultyName}'s Consultancies/Research Projects`
                  : "Consultancies/Research Projects"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectsChart data={filteredProjects} projectStatus={projectStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Patents` : "Patents Filed/Granted"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PatentsChart data={filteredPatents} patentStatus={patentStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Events` : "Faculty Events"}</CardTitle>
            </CardHeader>
            <CardContent>
              <EventsChart data={filteredEvents} eventType={eventType} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
