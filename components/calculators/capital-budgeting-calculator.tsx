"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw, Plus, Minus, Calculator } from "lucide-react";

export function CapitalBudgetingCalculator() {
  // State for calculation mode
  const [mode, setMode] = useState<"cashflow" | "depreciation" | "capitalBudgeting">("capitalBudgeting");
  
  // Common states
  const [initialInvestment, setInitialInvestment] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<string>("");
  const [uniformCashFlow, setUniformCashFlow] = useState<string>("");
  
  // Cash flow states (used in both cashflow and capitalBudgeting modes)
  const [cashFlows, setCashFlows] = useState<{year: number, amount: string}[]>([
    {year: 1, amount: ""},
  ]);
  
  // Depreciation states
  const [assetCost, setAssetCost] = useState<string>("");
  const [salvageValue, setSalvageValue] = useState<string>("0");
  const [usefulLife, setUsefulLife] = useState<string>("5");
  
  // Cash flow generation states
  const [cashFlowInputs, setCashFlowInputs] = useState<{
    inflow: string;
    outflow: string;
    taxRate: string;
    years: string;
    includeDepreciation: boolean;
    depreciationAmount: string;
    projectDuration: string;
  }>({
    inflow: "",
    outflow: "",
    taxRate: "",
    years: "5",
    includeDepreciation: true,
    depreciationAmount: "",
    projectDuration: "5"
  });
  
  // Results states
  const [results, setResults] = useState<{
    npv: number | null;
    irr: number | null;
    pi: number | null;
    paybackPeriod: number | null;
    depreciation: number | null;
    annualCashFlows: {year: number, amount: number}[] | null;
  }>({
    npv: null,
    irr: null,
    pi: null,
    paybackPeriod: null,
    depreciation: null,
    annualCashFlows: null
  });
  
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("calculator");

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("capitalBudgetingCalculatorState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setInitialInvestment(parsedState.initialInvestment || "");
        setDiscountRate(parsedState.discountRate || "");
        setCashFlows(parsedState.cashFlows || [
          {year: 1, amount: ""},
        ]);
        setMode(parsedState.mode || "capitalBudgeting");
        setAssetCost(parsedState.assetCost || "");
        setSalvageValue(parsedState.salvageValue || "0");
        setUsefulLife(parsedState.usefulLife || "5");
        setCashFlowInputs(parsedState.cashFlowInputs || {
          inflow: "",
          outflow: "",
          taxRate: "",
          years: "5",
          includeDepreciation: true,
          depreciationAmount: "",
          projectDuration: "5"
        });
      } catch (e) {
        console.error("Error parsing saved state:", e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      initialInvestment,
      discountRate,
      cashFlows,
      mode,
      assetCost,
      salvageValue,
      usefulLife,
      cashFlowInputs,
      uniformCashFlow
    };
    localStorage.setItem("capitalBudgetingCalculatorState", JSON.stringify(stateToSave));
  }, [
    initialInvestment, 
    discountRate, 
    cashFlows, 
    mode,
    assetCost,
    salvageValue,
    usefulLife,
    cashFlowInputs,
    uniformCashFlow
  ]);

  // Validate inputs based on mode
  const validateInputs = () => {
    if (mode === "capitalBudgeting") {
      if (isNaN(Number(initialInvestment))) {
        setError("Please enter a valid Initial Investment");
        return false;
      }
      if (isNaN(Number(discountRate))) {
        setError("Please enter a valid Discount Rate");
        return false;
      } 
      if (cashFlows.some(flow => isNaN(Number(flow.amount)))) {
        setError("Please enter valid numbers for all cash flows");
        return false;
      }
    }
    
    if (mode === "depreciation") {
      if (isNaN(Number(assetCost))) {
        setError("Please enter a valid Asset Cost");
        return false;
      }
      if (isNaN(Number(salvageValue))) {
        setError("Please enter a valid Salvage Value");
        return false;
      }
      if (isNaN(Number(usefulLife)) || Number(usefulLife) <= 0) {
        setError("Please enter a valid Useful Life (years)");
        return false;
      }
    }
    
    if (mode === "cashflow") {
      if (isNaN(Number(cashFlowInputs.inflow))) {
        setError("Please enter a valid Cash Inflow");
        return false;
      }
      if (isNaN(Number(cashFlowInputs.outflow))) {
        setError("Please enter a valid Cash Outflow");
        return false;
      }
      if (isNaN(Number(cashFlowInputs.taxRate)) || Number(cashFlowInputs.taxRate) < 0 || Number(cashFlowInputs.taxRate) > 100) {
        setError("Please enter a valid Tax Rate (0-100)");
        return false;
      }
      if (isNaN(Number(cashFlowInputs.years)) || Number(cashFlowInputs.years) <= 0) {
        setError("Please enter a valid number of Years");
        return false;
      }
      if (isNaN(Number(cashFlowInputs.projectDuration)) || Number(cashFlowInputs.projectDuration) <= 0) {
        setError("Please enter a valid Project Duration");
        return false;
      }
      if (cashFlowInputs.includeDepreciation && isNaN(Number(cashFlowInputs.depreciationAmount))) {
        setError("Please enter a valid Depreciation Amount");
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  // Calculate results based on mode
  useEffect(() => {
    if (mode === "capitalBudgeting") {
      calculateCapitalBudgeting();
    } else if (mode === "depreciation") {
      calculateDepreciation();
    } else if (mode === "cashflow") {
      calculateCashFlows();
    }
  }, [mode, initialInvestment, discountRate, cashFlows, assetCost, salvageValue, usefulLife, cashFlowInputs]);

  const applyUniformCashFlow = () => {
    if (uniformCashFlow === "" || isNaN(Number(uniformCashFlow))) return;
    
    const newCashFlows = cashFlows.map(flow => ({
      ...flow,
      amount: uniformCashFlow
    }));
    setCashFlows(newCashFlows);
  };

  const calculateBudgetingMetrics = () => {
  if (!results.annualCashFlows) return;

  // Set the cash flows for capital budgeting with truncated decimals
  const newCashFlows = results.annualCashFlows.map(flow => ({
    year: flow.year,
    amount: truncateDecimal(flow.amount, 2).toString()
  }));
  
  setCashFlows(newCashFlows);
  setMode("capitalBudgeting");
  
  // If initial investment is empty, use the asset cost if available
  if (initialInvestment === "" && assetCost !== "") {
    setInitialInvestment(assetCost);
  }
};

// Helper function to truncate decimals without rounding
const truncateDecimal = (num: number, decimalPlaces: number) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
};
  // Calculate capital budgeting metrics
  const calculateCapitalBudgeting = () => {
    if (!validateInputs()) return;

    try {
      const initialInv = Number(initialInvestment);
      const rate = Number(discountRate) / 100;
      const flows = cashFlows.map(flow => Number(flow.amount));

      // Calculate NPV
      const presentValueFlows = flows.map((flow, index) => flow / Math.pow(1 + rate, index + 1));
      const npv = presentValueFlows.reduce((sum, val) => sum + val, 0) - initialInv;

      // Calculate PI
      const pi = initialInv > 0 ? (npv + initialInv) / initialInv : null;

      // Calculate Payback Period
      let cumulativeFlow = 0;
      let paybackPeriod = null;
      for (let i = 0; i < flows.length; i++) {
        cumulativeFlow += flows[i];
        if (cumulativeFlow >= initialInv) {
          const excessCashFlow = cumulativeFlow - initialInv;
          const fractionOfYear = excessCashFlow / flows[i];
          paybackPeriod = i + 1 - fractionOfYear;
          break;
        }
      }

      // Calculate IRR
      let irr = null;
      try {
        if (flows.some(flow => flow > 0)) {
          irr = calculateIRR(initialInv, flows) * 100;
        }
      } catch (e) {
        console.error("IRR calculation failed:", e);
      }

      setResults(prev => ({
        ...prev,
        npv,
        irr,
        pi,
        paybackPeriod,
        depreciation: null,
        annualCashFlows: null
      }));
    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
    }
  };

  // Calculate straight-line depreciation
  const calculateDepreciation = () => {
    if (!validateInputs()) return;

    try {
      const cost = Number(assetCost);
      const salvage = Number(salvageValue);
      const life = Number(usefulLife);

      const depreciation = (cost - salvage) / life;
      
      setResults(prev => ({
        ...prev,
        depreciation,
        annualCashFlows: null,
        npv: null,
        irr: null,
        pi: null,
        paybackPeriod: null
      }));
      
      // Auto-fill initial investment if empty
      if (initialInvestment === "" || initialInvestment === "0") {
        setInitialInvestment(cost.toString());
      }
      
      setError(null);
    } catch (error) {
      console.error("Depreciation calculation error:", error);
      setError("An error occurred during depreciation calculation.");
    }
  };

  // Calculate after-tax cash flows
  const calculateCashFlows = () => {
    if (!validateInputs()) return;
  
    try {
      const inflow = Number(cashFlowInputs.inflow);
      const outflow = Number(cashFlowInputs.outflow);
      const taxRateDecimal = Number(cashFlowInputs.taxRate) / 100;
      const years = Number(cashFlowInputs.years);
      const projectDuration = Number(cashFlowInputs.projectDuration);
  
      // Calculate depreciation
      let depreciation = 0;
      if (cashFlowInputs.includeDepreciation && initialInvestment !== "") {
        const assetCost = Number(initialInvestment);
        depreciation = assetCost / projectDuration;
        setCashFlowInputs(prev => ({
          ...prev,
          depreciationAmount: depreciation.toFixed(2)
        }));
      } else if (cashFlowInputs.includeDepreciation) {
        depreciation = Number(cashFlowInputs.depreciationAmount);
      }
  
      // Calculate cash flows
      const annualCashFlows = Array.from({length: years}, (_, i) => {
        const taxableIncome = inflow - outflow - depreciation;
        const tax = taxableIncome > 0 ? taxableIncome * taxRateDecimal : 0;
        const cashFlow = (inflow - outflow - depreciation) * (1 - taxRateDecimal) + depreciation;
        
        return {
          year: i + 1,
          amount: cashFlow
        };
      });
  
      // Update results
      setResults(prev => ({
        ...prev,
        annualCashFlows,
        depreciation: cashFlowInputs.includeDepreciation ? depreciation : null
      }));
  
    } catch (error) {
      console.error("Cash flow calculation error:", error);
      setError("Error in cash flow calculation. Please check your inputs.");
    }
  };

  // IRR calculation using Newton-Raphson method
  const calculateIRR = (initialInvestment: number, cashFlows: number[]): number => {
    let guess = 0.1;
    let prevGuess = 0;
    const maxIterations = 1000;
    const tolerance = 0.0000001;
    const allFlows = [-initialInvestment, ...cashFlows];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let npv = 0;
      let derivative = 0;

      for (let i = 0; i < allFlows.length; i++) {
        npv += allFlows[i] / Math.pow(1 + guess, i);
        if (i > 0) {
          derivative += -i * allFlows[i] / Math.pow(1 + guess, i + 1);
        }
      }

      if (Math.abs(npv) < tolerance) return guess;
      if (Math.abs(derivative) < tolerance) {
        guess += 0.01;
        continue;
      }

      prevGuess = guess;
      guess = guess - npv / derivative;

      if (guess < -0.99 || !isFinite(guess)) {
        guess = 0.1;
      }

      if (Math.abs(guess - prevGuess) < tolerance) {
        return guess;
      }
    }

    return fallbackIRRCalculation(initialInvestment, cashFlows);
  };

  // Fallback IRR calculation using bisection method
  const fallbackIRRCalculation = (initialInvestment: number, cashFlows: number[]): number => {
    let low = -0.99;
    let high = 10;
    
    const calculateNPV = (rate: number) => {
      let npv = -initialInvestment;
      for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
      }
      return npv;
    };

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const npvMid = calculateNPV(mid);
      
      if (Math.abs(npvMid) < 0.0001) return mid;
      
      if (npvMid * calculateNPV(low) < 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
    
    return (low + high) / 2;
  };

  // Add/remove cash flow years
  const addCashFlow = () => {
    const newYear = cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].year + 1 : 1;
    setCashFlows([...cashFlows, {year: newYear, amount: ""}]);
  };

  const removeCashFlow = () => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.slice(0, -1));
    }
  };

  const updateCashFlow = (index: number, value: string) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index].amount = value;
    setCashFlows(newCashFlows);
  };

  // Update cash flow inputs
  const updateCashFlowInput = (field: keyof typeof cashFlowInputs, value: string | boolean) => {
    setCashFlowInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset all form values
  const handleReset = () => {
    setInitialInvestment("");
    setDiscountRate("");
    setCashFlows([
      {year: 1, amount: ""},
    ]);
    setAssetCost("");
    setSalvageValue("");
    setUsefulLife("5");
    setCashFlowInputs({
      inflow: "",
      outflow: "",
      taxRate: "",
      years: "5",
      includeDepreciation: false,
      depreciationAmount: "",
      projectDuration: "5"
    });
    setResults({
      npv: null,
      irr: null,
      pi: null,
      paybackPeriod: null,
      depreciation: null,
      annualCashFlows: null
    });
    setError(null);
    setUniformCashFlow("");
    localStorage.removeItem("capitalBudgetingCalculatorState");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Budgeting Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Evaluate investments with cash flow analysis, depreciation, and capital budgeting techniques.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes & Formulas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inputs</CardTitle>
                  <CardDescription>
                    {mode === "cashflow" ? "Calculate after-tax cash flows" : 
                     mode === "depreciation" ? "Calculate straight-line depreciation" : 
                     "Enter investment details for analysis"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Mode selection buttons */}
                  <div className="flex gap-2 mb-4">
                  <Button
                      variant={mode === "capitalBudgeting" ? "default" : "outline"}
                      onClick={() => setMode("capitalBudgeting")}
                      className="flex-1"
                    >
                      Budgeting
                    </Button>
                    <Button
                      variant={mode === "cashflow" ? "default" : "outline"}
                      onClick={() => setMode("cashflow")}
                      className="flex-1"
                    >
                      Cash Flows
                    </Button>
                    <Button
                      variant={mode === "depreciation" ? "default" : "outline"}
                      onClick={() => setMode("depreciation")}
                      className="flex-1"
                    >
                      Depreciation
                    </Button>
                    
                  </div>

                  {/* Common inputs */}
                  {mode !== "depreciation" && (
                    <InputGroup
                      id="initialInvestment"
                      label="Initial Investment"
                      value={initialInvestment}
                      onChange={setInitialInvestment}
                      type="text"
                      prefix="$"
                    />
                  )}

                  {mode === "capitalBudgeting" && (
                    <InputGroup
                      id="discountRate"
                      label="Discount Rate"
                      value={discountRate}
                      onChange={setDiscountRate}
                      type="text"
                      suffix="%"
                    />
                  )}

                  {/* Depreciation inputs */}
                  {mode === "depreciation" && (
                    <>
                      <InputGroup
                        id="assetCost"
                        label="Asset Cost"
                        value={assetCost}
                        onChange={setAssetCost}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id="salvageValue"
                        label="Salvage Value"
                        value={salvageValue}
                        onChange={setSalvageValue}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id="usefulLife"
                        label="Useful Life (years)"
                        value={usefulLife}
                        onChange={setUsefulLife}
                        type="text"
                      />
                    </>
                  )}

                  {/* Cash flow inputs */}
                  {mode === "cashflow" && (
                    <>
                      <InputGroup
                        id="cashInflow"
                        label="Annual Cash Inflow"
                        value={cashFlowInputs.inflow}
                        onChange={(value) => updateCashFlowInput("inflow", value)}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id="cashOutflow"
                        label="Annual Cash Outflow"
                        value={cashFlowInputs.outflow}
                        onChange={(value) => updateCashFlowInput("outflow", value)}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id="taxRate"
                        label="Tax Rate"
                        value={cashFlowInputs.taxRate}
                        onChange={(value) => updateCashFlowInput("taxRate", value)}
                        type="text"
                        suffix="%"
                      />
                      <InputGroup
                        id="projectYears"
                        label="Cash Flow Duration (years)"
                        value={cashFlowInputs.years}
                        onChange={(value) => updateCashFlowInput("years", value)}
                        type="text"
                      />
                      <InputGroup
                        id="projectDuration"
                        label="Project Duration (years)"
                        value={cashFlowInputs.projectDuration}
                        onChange={(value) => updateCashFlowInput("projectDuration", value)}
                        type="text"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeDepreciation"
                          checked={cashFlowInputs.includeDepreciation}
                          onChange={(e) => updateCashFlowInput("includeDepreciation", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="includeDepreciation" className="text-sm font-medium">
                          Include Depreciation in Tax Calculation
                        </label>
                      </div>
                      {cashFlowInputs.includeDepreciation && (
                        <InputGroup
                          id="depreciationAmount"
                          label="Annual Depreciation Amount"
                          value={cashFlowInputs.depreciationAmount}
                          onChange={(value) => updateCashFlowInput("depreciationAmount", value)}
                          type="text"
                          prefix="$"
                        />
                      )}
                    </>
                  )}

                  {/* Cash flows display for capital budgeting mode only */}
                  {mode === "capitalBudgeting" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cash Flows:</label>
                      
                      {/* Add uniform cash flow input */}
                      <div className="flex gap-2 items-end">
                        <InputGroup
                          id="uniformCashFlow"
                          label="Uniform Cash Flow"
                          value={uniformCashFlow}
                          onChange={setUniformCashFlow}
                          type="text"
                          prefix="$"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={applyUniformCashFlow}
                          className="flex items-center gap-1 h-10"
                        >
                          <Calculator className="h-4 w-4" />
                          Apply to All
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {cashFlows.map((flow, index) => (
                          <InputGroup
                            key={flow.year}
                            id={`cashFlow-${flow.year}`}
                            label={`Year ${flow.year}`}
                            value={flow.amount}
                            onChange={(value) => updateCashFlow(index, value)}
                            type="text"
                            prefix="$"
                          />
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeCashFlow}
                          disabled={cashFlows.length <= 1}
                          className="flex items-center gap-1"
                        >
                          <Minus className="h-4 w-4" />
                          Remove Year
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addCashFlow}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Year
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {mode === "cashflow" ? "After-tax cash flow results" : 
                   mode === "depreciation" ? "Depreciation calculation" : 
                   "Capital budgeting metrics"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error ? (
                  <div className="text-center text-red-500">
                    <p className="text-lg">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Depreciation Results */}
                    {mode === "depreciation" && results.depreciation !== null && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Annual Depreciation</h3>
                          <div className="text-2xl font-bold text-primary">
                            ${results.depreciation.toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Straight-line method: (Cost - Salvage Value) / Useful Life
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cash Flow Results */}
                    {/* Cash Flow Results */}
                    {mode === "cashflow" && results.annualCashFlows !== null && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Annual After-Tax Cash Flows</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cashFlowInputs.includeDepreciation 
                              ? "Includes depreciation tax shield" 
                              : "Does not include depreciation"}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="space-y-1">
                            {results.annualCashFlows.map((flow) => (
                              <div key={flow.year} className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Year {flow.year}:
                                </span>
                                <span className="font-mono">
                                  ${flow.amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {cashFlowInputs.includeDepreciation && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Depreciation Used</h3>
                            <div className="text-xl text-primary">
                              ${Number(cashFlowInputs.depreciationAmount).toFixed(2)} per year
                            </div>
                          </div>
                        )}

                        {/* Add this button to calculate budgeting metrics */}
                        <Button
                          variant="default"
                          onClick={calculateBudgetingMetrics}
                          className="w-full mt-4"
                        >
                          Calculate Capital Budgeting Metrics
                        </Button>
                      </div>
                    )}

                    {/* Capital Budgeting Results */}
                    {mode === "capitalBudgeting" && (
                      <>
                        {results.npv !== null && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Net Present Value (NPV)</h3>
                            <div className="text-2xl font-bold text-primary">
                              ${results.npv.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {results.npv >= 0 
                                ? "Acceptable (NPV ≥ 0)" 
                                : "Not acceptable (NPV < 0)"}
                            </p>
                          </div>
                        )}

                        {results.pi !== null && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Profitability Index (PI)</h3>
                            <div className="text-2xl font-bold text-primary">
                              {results.pi.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {results.pi >= 1 
                                ? "Acceptable (PI ≥ 1)" 
                                : "Not acceptable (PI < 1)"}
                            </p>
                          </div>
                        )}

                        {results.irr !== null && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Internal Rate of Return (IRR)</h3>
                            <div className="text-2xl font-bold text-primary">
                              {results.irr.toFixed(2)}%
                            </div>
                            {discountRate && !isNaN(Number(discountRate)) && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {results.irr >= Number(discountRate)
                                  ? "Acceptable (IRR ≥ discount rate)"
                                  : "Not acceptable (IRR < discount rate)"}
                              </p>
                            )}
                          </div>
                        )}

                        {results.paybackPeriod !== null && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Payback Period</h3>
                            <div className="text-2xl font-bold text-primary">
                              {results.paybackPeriod.toFixed(2)} years
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {results.paybackPeriod <= cashFlows.length
                                ? "Payback within forecast period"
                                : "Payback beyond forecast period"}
                            </p>
                          </div>
                        )}

                        {mode === "capitalBudgeting" && cashFlows.some(f => f.amount !== "") && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Cash Flows</h3>
                            <div className="space-y-1">
                              {cashFlows.map((flow) => (
                                <div key={flow.year} className="flex justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Year {flow.year}:
                                  </span>
                                  <span className="font-mono">
                                    ${Number(flow.amount).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Capital Budgeting Formulas & Notes</CardTitle>
              <CardDescription>Understanding investment evaluation methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">The Formulas</h3>
                <p className="mb-4 font-mono">
                  NPV = ∑(Cash Flowₜ / (1 + r)ᵗ) - Initial Investment
                </p>
                <p className="mb-4 font-mono">
                  IRR: The discount rate that makes NPV = 0
                </p>
                <p className="mb-4 font-mono">
                  PI = (NPV + Initial Investment) / Initial Investment
                </p>
                <p className="mb-4 font-mono">
                  Payback Period: Time to recover initial investment
                </p>
                <p className="mb-4 font-mono">
                  Depreciation = (Asset Cost - Salvage Value) / Useful Life
                </p>
                <p className="mb-4 font-mono">
                  After-Tax Cash Flow = (Inflow - Outflow - Depreciation) × (1 - Tax Rate) + Depreciation
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>Positive NPV means the investment adds value</li>
                    <li>IRR should exceed the cost of capital</li>
                    <li>PI greater than 1 indicates a profitable investment</li>
                    <li>Shorter payback periods are generally preferred</li>
                    <li>Depreciation reduces taxable income but is added back to cash flow</li>
                    <li>After-tax cash flows reflect the true benefit of the investment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}