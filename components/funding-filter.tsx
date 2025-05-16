"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FundingFilterProps {
  fundingRange: [number, number]
  onFundingRangeChange: (range: [number, number]) => void
  min: number
  max: number
}

export function FundingFilter({ fundingRange, onFundingRangeChange, min, max }: FundingFilterProps) {
  const [minInput, setMinInput] = useState(fundingRange[0].toString())
  const [maxInput, setMaxInput] = useState(fundingRange[1].toString())

  // Format currency in lakhs (1 lakh = 100,000)
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`
    }
    return `₹${value.toLocaleString()}`
  }

  const handleApply = () => {
    const minValue = Math.max(min, Number(minInput) || min)
    const maxValue = Math.min(max, Number(maxInput) || max)

    // Ensure min is not greater than max
    const validMin = Math.min(minValue, maxValue)
    const validMax = Math.max(minValue, maxValue)

    onFundingRangeChange([validMin, validMax])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Funding Range:</span>
        <span>
          {formatCurrency(fundingRange[0])} - {formatCurrency(fundingRange[1])}
        </span>
      </div>

      <div className="pt-4">
        <Slider
          defaultValue={fundingRange}
          min={min}
          max={max}
          step={10000}
          value={fundingRange}
          onValueChange={onFundingRangeChange as (value: number[]) => void}
          className="my-4"
        />
      </div>

    </div>
  )
}
