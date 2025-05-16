"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { facultyData } from "@/data/mock-data"

interface FacultyFilterProps {
  selectedFaculty: number | null
  onSelectFaculty: (facultyId: number | null) => void
}

export function FacultyFilter({ selectedFaculty, onSelectFaculty }: FacultyFilterProps) {
  const [open, setOpen] = useState(false)

  const selectedFacultyName = selectedFaculty ? facultyData.find((f) => f.id === selectedFaculty)?.name : "All Faculty"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedFacultyName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search faculty..." />
          <CommandList>
            <CommandEmpty>No faculty found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelectFaculty(null)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <Check className={cn("mr-2 h-4 w-4", selectedFaculty === null ? "opacity-100" : "opacity-0")} />
                All Faculty
              </CommandItem>
              {facultyData.map((faculty) => (
                <CommandItem
                  key={faculty.id}
                  onSelect={() => {
                    onSelectFaculty(faculty.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedFaculty === faculty.id ? "opacity-100" : "opacity-0")} />
                  {faculty.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
