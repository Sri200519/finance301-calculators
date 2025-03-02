"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RotateCcw } from "lucide-react";

export function AnnuityCalculator() {
  // State variables with localStorage initialization
  const [payment, setPayment] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_payment') || "" : "");
  const [rate, setRate] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_rate') || "" : "");
  const [periods, setPeriods] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_periods') || "" : "");
  const [result, setResult] = useState<number | null>(null);
  const [solveFor, setSolveFor] = useState<"presentValue" | "futureValue" | "paymentPV" | "paymentFV">(() => 
    (typeof window !== 'undefined' ? localStorage.getItem('annuity_solveFor') : null) as any || "presentValue");
  const [annuityType, setAnnuityType] = useState<"ordinary" | "due">(() => 
    (typeof window !== 'undefined' ? localStorage.getItem('annuity_type') : null) as any || "ordinary");
  const [compoundFrequency, setCompoundFrequency] = useState<"annual" | "semiannual" | "quarterly" | "monthly" | "custom">(() => 
    (typeof window !== 'undefined' ? localStorage.getItem('annuity_compoundFreq') : null) as any || "annual");
  const [customFrequency, setCustomFrequency] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_customFreq') || "" : "");
  const [pvOrFv, setPvOrFv] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_pvOrFv') || "" : "");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('annuity_activeTab') || "calculator" : "calculator");

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('annuity_payment', payment);
      localStorage.setItem('annuity_rate', rate);
      localStorage.setItem('annuity_periods', periods);
      localStorage.setItem('annuity_solveFor', solveFor);
      localStorage.setItem('annuity_type', annuityType);
      localStorage.setItem('annuity_compoundFreq', compoundFrequency);
      localStorage.setItem('annuity_customFreq', customFrequency);
      localStorage.setItem('annuity_pvOrFv', pvOrFv);
      localStorage.setItem('annuity_activeTab', activeTab);
    }
  }, [payment, rate, periods, solveFor, annuityType, compoundFrequency, customFrequency, pvOrFv, activeTab]);

  const getCompoundingPeriods = () => {
    switch (compoundFrequency) {
      case "annual":
        return 1;
      case "semiannual":
        return 2;
      case "quarterly":
        return 4;
      case "monthly":
        return 12;
      case "custom":
        return Number.parseFloat(customFrequency) || 1;
      default:
        return 1;
    }
  };

  const resetCalculator = () => {
    setPayment("");
    setRate("");
    setPeriods("");
    setPvOrFv("");
    setCustomFrequency("");
    setSolveFor("presentValue");
    setAnnuityType("ordinary");
    setCompoundFrequency("annual");
    setResult(null);
    setError(null);
    
    // Clear localStorage for this calculator
    if (typeof window !== 'undefined') {
      localStorage.removeItem('annuity_payment');
      localStorage.removeItem('annuity_rate');
      localStorage.removeItem('annuity_periods');
      localStorage.removeItem('annuity_solveFor');
      localStorage.removeItem('annuity_type');
      localStorage.removeItem('annuity_compoundFreq');
      localStorage.removeItem('annuity_customFreq');
      localStorage.removeItem('annuity_pvOrFv');
      // Don't remove activeTab to preserve the tab state
    }
  };

  const calculateAnnuity = () => {
    try {
      const P = Number.parseFloat(payment);
      const r = Number.parseFloat(rate) / 100;
      const n = Number.parseFloat(periods);
      const m = getCompoundingPeriods(); 
      const rAdjusted = r / m; 
      const nAdjusted = n * m; 

      if (solveFor === "presentValue") {
        // Present Value of Annuity
        const presentValue = annuityType === "ordinary"
          ? P * ((1 - Math.pow(1 + rAdjusted, -nAdjusted)) / rAdjusted) // Ordinary Annuity
          : P * ((1 - Math.pow(1 + rAdjusted, -nAdjusted)) / rAdjusted) * (1 + rAdjusted); // Annuity Due
        setResult(presentValue);
      } else if (solveFor === "futureValue") {
        // Future Value of Annuity
        const futureValue = annuityType === "ordinary"
          ? P * ((Math.pow(1 + rAdjusted, nAdjusted) - 1) / rAdjusted) // Ordinary Annuity
          : P * ((Math.pow(1 + rAdjusted, nAdjusted) - 1) / rAdjusted) * (1 + rAdjusted); // Annuity Due
        setResult(futureValue);
      } else if (solveFor === "paymentPV") {
        // Payment for Present Value
        const PV = Number.parseFloat(pvOrFv);
        const paymentAmount = annuityType === "ordinary"
          ? (PV * rAdjusted) / (1 - Math.pow(1 + rAdjusted, -nAdjusted)) // Ordinary Annuity
          : (PV * rAdjusted) / ((1 - Math.pow(1 + rAdjusted, -nAdjusted)) * (1 + rAdjusted)); // Annuity Due
        setResult(paymentAmount);
      } else if (solveFor === "paymentFV") {
        // Payment for Future Value
        const FV = Number.parseFloat(pvOrFv);
        const paymentAmount = annuityType === "ordinary"
          ? (FV * rAdjusted) / (Math.pow(1 + rAdjusted, nAdjusted) - 1) // Ordinary Annuity
          : (FV * rAdjusted) / ((Math.pow(1 + rAdjusted, nAdjusted) - 1) * (1 + rAdjusted)); // Annuity Due
        setResult(paymentAmount);
      }
      
      // Save result to localStorage
      if (typeof window !== 'undefined' && result !== null) {
        localStorage.setItem('annuity_lastResult', result.toString());
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
      setResult(null);
    }
  };

  const validateInputs = () => {
    if ((solveFor === "presentValue" || solveFor === "futureValue") && isNaN(Number.parseFloat(payment))) {
      setError("Please enter a valid number for Payment Amount.");
      return false;
    }
    if ((solveFor === "paymentPV" || solveFor === "paymentFV") && isNaN(Number.parseFloat(pvOrFv))) {
      setError("Please enter a valid number for Value.");
      return false;
    }
    if (isNaN(Number.parseFloat(rate))) {
      setError("Please enter a valid number for Annual Interest Rate.");
      return false;
    }
    if (isNaN(Number.parseFloat(periods))) {
      setError("Please enter a valid number for Number of Periods.");
      return false;
    }
    if (compoundFrequency === "custom" && isNaN(Number.parseFloat(customFrequency))) {
      setError("Please enter a valid number for Custom Frequency.");
      return false;
    }
    setError(null);
    return true;
  };

  useEffect(() => {
    // Check if we have enough values to calculate
    const shouldCalculate = (
      (solveFor === "presentValue" || solveFor === "futureValue") && payment !== "" && rate !== "" && periods !== "" ||
      (solveFor === "paymentPV" || solveFor === "paymentFV") && pvOrFv !== "" && rate !== "" && periods !== ""
    );
    
    if (shouldCalculate) {
      if (validateInputs()) {
        calculateAnnuity();
      }
    }
  }, [payment, rate, periods, solveFor, annuityType, compoundFrequency, customFrequency, pvOrFv]);

  // Try to restore previous result on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedResult = localStorage.getItem('annuity_lastResult');
      if (savedResult && !isNaN(Number.parseFloat(savedResult))) {
        setResult(Number.parseFloat(savedResult));
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annuity Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate present value, future value, or payment for annuities.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetCalculator} className="flex items-center gap-1">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes & Formulas</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Enter your values and select what to solve for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solve for:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={solveFor === "presentValue" ? "default" : "outline"}
                      onClick={() => setSolveFor("presentValue")}
                      className="w-full"
                    >
                      Present Value (PV)
                    </Button>
                    <Button
                      variant={solveFor === "futureValue" ? "default" : "outline"}
                      onClick={() => setSolveFor("futureValue")}
                      className="w-full"
                    >
                      Future Value (FV)
                    </Button>
                    <Button
                      variant={solveFor === "paymentPV" ? "default" : "outline"}
                      onClick={() => setSolveFor("paymentPV")}
                      className="w-full"
                    >
                      Payment-PMT (PV)
                    </Button>
                    <Button
                      variant={solveFor === "paymentFV" ? "default" : "outline"}
                      onClick={() => setSolveFor("paymentFV")}
                      className="w-full"
                    >
                      Payment-PMT (FV)
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Annuity Type:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={annuityType === "ordinary" ? "default" : "outline"}
                      onClick={() => setAnnuityType("ordinary")}
                      className="w-full"
                    >
                      Ordinary Annuity
                    </Button>
                    <Button
                      variant={annuityType === "due" ? "default" : "outline"}
                      onClick={() => setAnnuityType("due")}
                      className="w-full"
                    >
                      Annuity Due
                    </Button>
                  </div>
                </div>

                {/* Payment Input */}
                <InputGroup
                  id="payment"
                  label={
                    solveFor === "paymentPV"
                      ? "Present Value"
                      : solveFor === "paymentFV"
                      ? "Future Value"
                      : "Payment Amount"
                  }
                  value={solveFor === "paymentPV" || solveFor === "paymentFV" ? pvOrFv : payment}
                  onChange={(value) => {
                    if (solveFor === "paymentPV" || solveFor === "paymentFV") {
                      setPvOrFv(value);
                    } else {
                      setPayment(value);
                    }
                  }}
                  type="text"
                  prefix="$"
                  className="no-spinners" 
                />

                {/* Rate Input */}
                <InputGroup
                  id="rate"
                  label="Annual Interest Rate"
                  value={rate}
                  onChange={setRate}
                  type="text"
                  suffix="%"
                  className="no-spinners" 
                />

                <InputGroup
                  id="periods"
                  label="Number of Periods"
                  value={periods}
                  onChange={setPeriods}
                  type="text"
                  suffix="years"
                  className="no-spinners" 
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Compound Frequency:</label>
                  <select
                    value={compoundFrequency} 
                    onChange={(e) => setCompoundFrequency(e.target.value as "annual" | "semiannual" | "quarterly" | "monthly" | "custom")} 
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="annual">Annually (1/yr)</option>
                    <option value="semiannual">Semiannually (2/yr)</option>
                    <option value="quarterly">Quarterly (4/yr)</option>
                    <option value="monthly">Monthly (12/yr)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {compoundFrequency === "custom" && (
                  <InputGroup
                    id="customFrequency"
                    label="Custom Frequency (times per year)"
                    value={customFrequency}
                    onChange={setCustomFrequency}
                    type="text"
                    className="no-spinners" 
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {solveFor === "presentValue"
                    ? "The present value of the annuity"
                    : solveFor === "futureValue"
                      ? "The future value of the annuity"
                      : solveFor === "paymentPV" || solveFor === "paymentFV"
                        ? "The required payment amount"
                        : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-full flex-col items-center justify-center py-6">
                  {error ? (
                    <div className="text-center text-red-500">
                      <p className="text-lg">{error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-primary">
                        {result !== null
                          ? `$${result.toFixed(2)}`
                          : "—"}
                      </div>
                      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        {solveFor === "presentValue"
                          ? "Present value of annuity"
                          : solveFor === "futureValue"
                            ? "Future value of annuity"
                            : solveFor === "paymentPV" || solveFor === "paymentFV"
                              ? "Required payment amount"
                              : "—"}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Annuity Formulas & Notes</CardTitle>
              <CardDescription>Understanding how annuities work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulas Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">The Formulas</h3>
                <p className="mb-4 font-mono">
                  Ordinary Annuity: FV = P * ((1 + r/m)^(n*m) - 1) / (r/m)
                </p>
                <p className="mb-4 font-mono">
                  Annuity Due: FV = P * ((1 + r/m)^(n*m) - 1) / (r/m) * (1 + r/m)
                </p>
                <p className="mb-4 font-mono">
                  Present Value (Ordinary Annuity): PV = P * (1 - (1 + r/m)^(-n*m)) / (r/m)
                </p>
                <p className="mb-4 font-mono">
                  Present Value (Annuity Due): PV = P * (1 - (1 + r/m)^(-n*m)) / (r/m) * (1 + r/m)
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>FV = Future Value</li>
                  <li>PV = Present Value</li>
                  <li>P = Payment Amount</li>
                  <li>r = Annual Interest Rate (decimal)</li>
                  <li>m = Compounding Frequency (times per year)</li>
                  <li>n = Number of Years</li>
                </ul>
              </div>

              {/* Key Insights Section */}
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    Annuities are financial products that provide a series of payments over time. They are commonly used for retirement planning, loans, and investments. Key insights include:
                  </p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>
                      <strong>Ordinary Annuity</strong>: Payments are made at the <strong>end</strong> of each period.
                    </li>
                    <li>
                      <strong>Annuity Due</strong>: Payments are made at the <strong>beginning</strong> of each period.
                    </li>
                    <li>
                      <strong>Compounding Frequency</strong>: Higher compounding frequencies (e.g., monthly vs. annually) result in higher future values due to more frequent interest application.
                    </li>
                    <li>
                      <strong>Present Value</strong>: Represents the current value of future payments, discounted at the given interest rate.
                    </li>
                    <li>
                      <strong>Future Value</strong>: Represents the total value of payments at a future date, including interest.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Common Applications Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Common Applications</h3>
                <p className="mb-4 text-sm">
                  Annuities are widely used in various financial scenarios:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Retirement Planning</strong>: Annuities provide a steady income stream during retirement.
                  </li>
                  <li>
                    <strong>Loans and Mortgages</strong>: Loan payments are often structured as annuities, where you pay a fixed amount over time.
                  </li>
                  <li>
                    <strong>Investments</strong>: Annuities can be used to grow savings over time with regular contributions.
                  </li>
                  <li>
                    <strong>Insurance</strong>: Some insurance products use annuities to provide payouts over a specified period.
                  </li>
                </ul>
              </div>

              {/* Example Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Example</h3>
                <p className="mb-4 text-sm">
                  Suppose you invest $1,000 annually at a 5% interest rate for 5 years, compounded annually:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Future Value (Ordinary Annuity)</strong>:  
                    FV = $1,000 * ((1 + 0.05)^5 - 1) / 0.05 = $5,525.63
                  </li>
                  <li>
                    <strong>Future Value (Annuity Due)</strong>:  
                    FV = $1,000 * ((1 + 0.05)^5 - 1) / 0.05 * (1 + 0.05) = $5,801.91
                  </li>
                  <li>
                    <strong>Present Value (Ordinary Annuity)</strong>:  
                    PV = $1,000 * (1 - (1 + 0.05)^(-5)) / 0.05 = $4,329.48
                  </li>
                  <li>
                    <strong>Present Value (Annuity Due)</strong>:  
                    PV = $1,000 * (1 - (1 + 0.05)^(-5)) / 0.05 * (1 + 0.05) = $4,545.95
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}