import type React from "react"
import { Calculator, Percent, DollarSign, TrendingUp, BarChart3, LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalculatorType } from "@/components/calculator-layout"
import { ModeToggle } from "@/components/mode-toggle"

interface SidebarProps {
  activeCalculator: CalculatorType
  setActiveCalculator: (calculator: CalculatorType) => void
}

interface CalculatorItem {
  id: CalculatorType
  name: string
  icon: React.ReactNode
}

export function Sidebar({ activeCalculator, setActiveCalculator }: SidebarProps) {
  const calculators: CalculatorItem[] = [
    {
      id: "lumpsum-calculator",
      name: "Value of Lump Sums",
      icon: <Percent className="h-5 w-5" />,
    },
    {
      id: "annuity-calculator",
      name: "Annuity Calculator",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      id: "perpetuity-calculator",
      name: "Perpetuity Calculator",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "tax-calculator",
      name: "Tax Calculator",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-full w-65 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"> {/* Increase width here */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
        <Calculator className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold flex-1">{/* Ensures title wraps and fits */}
          Finance 301 Calculators
        </h1>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {calculators.map((calculator) => (
            <button
              key={calculator.id}
              onClick={() => setActiveCalculator(calculator.id)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                activeCalculator === calculator.id
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <span className="mr-3">{calculator.icon}</span>
              {calculator.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <ModeToggle />
      </div>
    </div>
  )
}
