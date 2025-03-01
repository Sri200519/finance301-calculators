"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { CompoundInterestCalculator } from "@/components/calculators/lumpsum-calculator"
import { AnnuityCalculator } from "@/components/calculators/annuity-calculator"
import { PerpetuityCalculator } from "./calculators/perpetuity-calculator"
import { TaxCalculator } from "./calculators/tax-calculator"

export type CalculatorType =
  | "lumpsum-calculator"
  | "annuity-calculator"
  | "perpetuity-calculator"
  | "tax-calculator"

export function CalculatorLayout() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("lumpsum-calculator")

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "lumpsum-calculator":
        return <CompoundInterestCalculator />
      case "annuity-calculator":
        return <AnnuityCalculator />
      case "perpetuity-calculator":
        return <PerpetuityCalculator />
      case "tax-calculator":
        return <TaxCalculator />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeCalculator={activeCalculator} setActiveCalculator={setActiveCalculator} />
      <div className="flex-1 overflow-auto p-6 md:p-8">{renderCalculator()}</div>
    </div>
  )
}

