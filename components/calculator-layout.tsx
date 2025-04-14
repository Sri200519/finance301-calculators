"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { CompoundInterestCalculator } from "@/components/calculators/lumpsum-calculator"
import { AnnuityCalculator } from "@/components/calculators/annuity-calculator"
import { PerpetuityCalculator } from "./calculators/perpetuity-calculator"
import { TaxCalculator } from "./calculators/tax-calculator"
import { CouponBondCalculator } from "./calculators/bond-calculator"
import { DividendCapitalGainCalculator } from "./calculators/dividend-calculator"
import { TradingCalculator } from "./calculators/option-calculator"
import { CapitalBudgetingCalculator } from "./calculators/capital-budgeting-calculator"
import { RealOptionsCalculator } from "./calculators/real-options-calculator"
import { RiskCalculator } from "./calculators/risk-calculator"
import { Chat } from "./chat"
import { MessageCircle, X } from "lucide-react"
import { Button } from "./ui/button"

export type CalculatorType =
  | "lumpsum"
  | "annuity"
  | "perpetuity"
  | "tax"
  | "bond"
  | "dividend"
  | "options"
  | "budget"
  | "real-options"
  | "risk"

export function CalculatorLayout() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("lumpsum")
  const [isChatOpen, setIsChatOpen] = useState(false)

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "lumpsum":
        return <CompoundInterestCalculator />
      case "annuity":
        return <AnnuityCalculator />
      case "perpetuity":
        return <PerpetuityCalculator />
      case "tax":
        return <TaxCalculator />
      case "bond":
        return <CouponBondCalculator />
      case "dividend":
        return <DividendCapitalGainCalculator />
      case "options":
        return <TradingCalculator />
      case "budget":
        return <CapitalBudgetingCalculator />
      case "real-options":
        return <RealOptionsCalculator />
      case "risk":
        return <RiskCalculator />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeCalculator={activeCalculator} setActiveCalculator={setActiveCalculator} />
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`flex-1 overflow-auto p-6 md:p-8 transition-all duration-300 ${isChatOpen ? 'md:mr-96' : ''}`}>
          {renderCalculator()}
        </div>
        
        <div 
          className={`fixed md:absolute inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-96 bg-background md:border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 transform ${
            isChatOpen 
              ? 'translate-x-0' 
              : 'translate-x-full'
          } z-50`}
        >
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="text-lg font-semibold">Chat Assistant</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Chat onCalculatorSelect={(calc) => {
            setActiveCalculator(calc)
            // Close chat on mobile when calculator is selected
            if (window.innerWidth < 768) {
              setIsChatOpen(false)
            }
          }} />
        </div>

        <Button
          variant="default"
          size="icon"
          className={`fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform z-40 ${
            isChatOpen ? 'md:translate-x-[-384px]' : ''
          }`}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X className="h-5 w-5 md:block hidden" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}

