import React, { useState } from "react";
import { Calculator, Percent, DollarSign, TrendingUp, Scale, Landmark, Coins, Menu, X, LineChart, Banknote, Network, ListTree, SlidersHorizontal} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculatorType } from "@/components/calculator-layout";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps {
  activeCalculator: CalculatorType;
  setActiveCalculator: (calculator: CalculatorType) => void;
}

interface CalculatorItem {
  id: CalculatorType;
  name: string;
  icon: React.ReactNode;
}

export function Sidebar({ activeCalculator, setActiveCalculator }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const calculators: CalculatorItem[] = [
    {
      id: "lumpsum",
      name: "Value of Lump Sums",
      icon: <Coins className="h-5 w-5" />, // Represents a lump sum of money
    },
    {
      id: "annuity",
      name: "Annuity Calculator",
      icon: <Landmark className="h-5 w-5" />, // Represents regular payments (like a bank)
    },
    {
      id: "perpetuity",
      name: "Perpetuity Calculator",
      icon: <TrendingUp className="h-5 w-5" />, // Represents infinite growth
    },
    {
      id: "tax",
      name: "Tax Calculator",
      icon: <Scale className="h-5 w-5" />, // Represents balance and fairness (taxes)
    },
    {
      id: "bond",
      name: "Bond Calculator",
      icon: <Percent className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "dividend",
      name: "Stock Price Calculator",
      icon: <DollarSign className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "options",
      name: "Option Calculator",
      icon: <LineChart className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "budget",
      name: "Capital Budgeting Calculator",
      icon: <Banknote className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "real-options",
      name: "Real Options Calculator",
      icon: <Network className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "risk",
      name: "Risk Calculator",
      icon: <ListTree className="h-5 w-5" />, // Represents interest rates
    },
    {
      id: "wacc",
      name: "WACC Calculator",
      icon: <SlidersHorizontal className="h-5 w-5" />, // Represents interest rates
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-900 p-2 rounded-md shadow-md lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-65 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transform transition-transform lg:relative lg:translate-x-0", 
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Calculator className="mr-2 h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold flex-1">Finance 301 Calculators</h1>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {calculators.map((calculator) => (
              <button
                key={calculator.id}
                onClick={() => { setActiveCalculator(calculator.id); setIsOpen(false); }}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  activeCalculator === calculator.id
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
      
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 lg:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}