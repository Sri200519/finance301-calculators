"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DividendCapitalGainCalculator() {
  // State for inputs
  const [currentDividend, setCurrentDividend] = useState<string>("");
  const [expectedDividend, setExpectedDividend] = useState<string>("");
  const [requiredRateOfReturn, setRequiredRateOfReturn] = useState<string>("");
  const [growthRate, setGrowthRate] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [futurePrice, setFuturePrice] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [numberOfPeriods, setNumberOfPeriods] = useState<string>("");
  const [dividends, setDividends] = useState<string[]>([]);
  const [useSingleDividend, setUseSingleDividend] = useState<boolean>(true);

  // State for result
  const [result, setResult] = useState<number | null>(null);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for selected calculation type
  const [calculationType, setCalculationType] = useState<
    "ddm" | "dividendYield" | "capitalGainYield" | "ggm" | "dividendAtYearN" | "stockPricePerpetuity"
  >("ddm");
  
  // State to track if initialization has happened
  const [initialized, setInitialized] = useState<boolean>(false);

  // State to track if all required fields are filled
  const [allFieldsFilled, setAllFieldsFilled] = useState<boolean>(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("calculator");

  // Load data from localStorage only once on initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      const savedState = localStorage.getItem('dividendCalculatorState');
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          // Set all state values from localStorage
          setCalculationType(parsedState.calculationType || "ddm");
          setCurrentDividend(parsedState.currentDividend || "");
          setExpectedDividend(parsedState.expectedDividend || "");
          setRequiredRateOfReturn(parsedState.requiredRateOfReturn || "");
          setGrowthRate(parsedState.growthRate || "");
          setCurrentPrice(parsedState.currentPrice || "");
          setFuturePrice(parsedState.futurePrice || "");
          setYears(parsedState.years || "");
          setNumberOfPeriods(parsedState.numberOfPeriods || "");
          
          // Handling arrays correctly
          if (Array.isArray(parsedState.dividends)) {
            setDividends(parsedState.dividends);
          }
          
          setUseSingleDividend(parsedState.useSingleDividend !== undefined ? parsedState.useSingleDividend : true);
          
          // Optional: load result state too
          if (parsedState.result !== undefined) {
            setResult(parsedState.result);
          }
          
          // Load active tab if saved
          if (parsedState.activeTab) {
            setActiveTab(parsedState.activeTab);
          }
        } catch (e) {
          console.error("Error loading state from localStorage:", e);
        }
      }
      
      setInitialized(true);
    }
  }, [initialized]);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && initialized) {
      const stateToSave = {
        calculationType,
        currentDividend,
        expectedDividend,
        requiredRateOfReturn,
        growthRate,
        currentPrice,
        futurePrice,
        years,
        numberOfPeriods,
        dividends,
        useSingleDividend,
        result,
        activeTab
      };
      
      try {
        localStorage.setItem('dividendCalculatorState', JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Error saving state to localStorage:", e);
      }
    }
  }, [
    initialized,
    calculationType,
    currentDividend,
    expectedDividend,
    requiredRateOfReturn,
    growthRate,
    currentPrice,
    futurePrice,
    years,
    numberOfPeriods,
    dividends,
    useSingleDividend,
    result,
    activeTab
  ]);

  // Check if all required fields are filled based on calculation type
  useEffect(() => {
    if (!initialized) return;
    
    let fieldsValid = false;

    switch (calculationType) {
      case "ddm":
        if (useSingleDividend) {
          fieldsValid = 
            !!currentDividend && 
            !!requiredRateOfReturn && 
            !!numberOfPeriods && 
            !!futurePrice;
        } else {
          fieldsValid = 
            !!numberOfPeriods && 
            dividends.length === Number(numberOfPeriods) && 
            dividends.every(d => !!d) && 
            !!requiredRateOfReturn && 
            !!futurePrice;
        }
        break;
      case "dividendYield":
        fieldsValid = !!currentDividend && !!currentPrice;
        break;
      case "capitalGainYield":
        fieldsValid = !!currentPrice && !!futurePrice;
        break;
      case "ggm":
        fieldsValid = !!currentDividend && !!requiredRateOfReturn && !!growthRate;
        break;
      case "dividendAtYearN":
        fieldsValid = !!currentDividend && !!growthRate && !!years;
        break;
      case "stockPricePerpetuity":
        fieldsValid = !!currentDividend && !!requiredRateOfReturn;
        break;
    }

    setAllFieldsFilled(fieldsValid);

    // Auto-calculate when all fields are filled
    if (fieldsValid) {
      calculate();
    }
  }, [
    initialized,
    calculationType,
    currentDividend,
    currentPrice,
    dividends,
    expectedDividend,
    futurePrice,
    growthRate,
    numberOfPeriods,
    requiredRateOfReturn,
    useSingleDividend,
    years
  ]);

  // Effect to handle changes to numberOfPeriods
  useEffect(() => {
    if (!initialized) return;
    
    if (calculationType === "ddm" && !useSingleDividend) {
      const periods = Number(numberOfPeriods) || 0;
      
      // Resize dividends array based on numberOfPeriods
      if (periods > dividends.length) {
        // Add empty strings for new periods
        const newDividends = [...dividends];
        for (let i = dividends.length; i < periods; i++) {
          newDividends[i] = "";
        }
        setDividends(newDividends);
      } else if (periods < dividends.length) {
        // Trim array to match new periods count
        setDividends(dividends.slice(0, periods));
      }
    }
  }, [initialized, numberOfPeriods, calculationType, useSingleDividend, dividends]);

  // Calculate the missing value
  const calculate = () => {
    try {
      // Convert inputs to numbers
      const D0 = Number(currentDividend);
      const D1 = Number(expectedDividend);
      const r = Number(requiredRateOfReturn) / 100;
      const g = Number(growthRate) / 100;
      const P0 = Number(currentPrice);
      const P1 = Number(futurePrice);
      const n = Number(years);
      const numPeriods = Number(numberOfPeriods);

      // Validate inputs
      if (
        (calculationType === "ddm" && (
          isNaN(r) || r < 0 || isNaN(numPeriods) || numPeriods <= 0 || 
          (useSingleDividend && (isNaN(D0) || D0 < 0)) ||
          isNaN(P1) || P1 < 0
        )) ||
        (calculationType === "dividendYield" && (isNaN(D0) || D0 < 0 || isNaN(P0) || P0 <= 0)) ||
        (calculationType === "capitalGainYield" && (isNaN(P0) || P0 < 0 || isNaN(P1) || P1 < 0)) ||
        (calculationType === "ggm" && (isNaN(D0) || D0 < 0 || isNaN(r) || r <= 0 || isNaN(g) || g < 0)) ||
        (calculationType === "dividendAtYearN" && (isNaN(D0) || D0 < 0 || isNaN(g) || g < 0 || isNaN(n) || n < 0)) ||
        (calculationType === "stockPricePerpetuity" && (isNaN(D0) || D0 < 0 || isNaN(r) || r <= 0))
      ) {
        setError("Please enter valid positive numbers for all fields.");
        setResult(null);
        return;
      }

      // Calculate based on selected type
      switch (calculationType) {
        case "ddm":
          if (useSingleDividend) {
            let PV = 0;
            for (let i = 0; i < numPeriods; i++) {
              PV += D0 / Math.pow(1 + r, i + 1);
            }
            PV += P1 / Math.pow(1 + r, numPeriods);
            setResult(PV);
          } else {
            const parsedDividends = dividends.map(Number);
            if (parsedDividends.some(isNaN)) {
              setError("Please enter valid numbers for all dividend periods.");
              setResult(null);
              return;
            }

            let PV = 0;
            for (let i = 0; i < numPeriods; i++) {
              PV += parsedDividends[i] / Math.pow(1 + r, i + 1);
            }
            PV += P1 / Math.pow(1 + r, numPeriods);
            setResult(PV);
          }
          break;

        case "dividendYield":
          setResult((D0 / P0) * 100);
          break;

        case "capitalGainYield":
          setResult(((P1 - P0) / P0) * 100);
          break;

        case "ggm":
          if (r <= g) {
            setError("Required rate of return must be greater than the growth rate.");
            setResult(null);
            return;
          }
          setResult((D0 * (1 + g)) / (r - g));
          break;

        case "dividendAtYearN":
          setResult(D0 * Math.pow(1 + g, n));
          break;

        case "stockPricePerpetuity":
          setResult(D0 / r);
          break;

        default:
          setError("Invalid calculation type.");
          setResult(null);
          return;
      }

      setError(null);
    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
      setResult(null);
    }
  };

  // Function to handle dividend changes for each period
  const handleDividendChange = (index: number, value: string) => {
    const newDividends = [...dividends];
    newDividends[index] = value;
    setDividends(newDividends);
  };

  // Reset inputs when changing calculation type
  const handleCalculationTypeChange = (type: "ddm" | "dividendYield" | "capitalGainYield" | "ggm" | "dividendAtYearN" | "stockPricePerpetuity") => {
    setCalculationType(type);
    setResult(null);
    setError(null);
  };

  // Reset all fields
  const resetAll = () => {
    setCurrentDividend("");
    setExpectedDividend("");
    setRequiredRateOfReturn("");
    setGrowthRate("");
    setCurrentPrice("");
    setFuturePrice("");
    setYears("");
    setNumberOfPeriods("");
    setDividends([]);
    setUseSingleDividend(true);
    setResult(null);
    setError(null);
    
    // Clear localStorage for this calculator
    localStorage.removeItem('dividendCalculatorState');
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Price and Dividend Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate stock prices, yields, and dividends using various models.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetAll}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes & Formulas</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>
                  Choose what to calculate and enter the required values.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Calculation type buttons - two in a row */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleCalculationTypeChange("ddm")}
                    variant={calculationType === "ddm" ? "default" : "outline"}
                    className="w-full"
                  >
                    Stock Price (DDM)
                  </Button>
                  <Button
                    onClick={() => handleCalculationTypeChange("dividendAtYearN")}
                    variant={calculationType === "dividendAtYearN" ? "default" : "outline"}
                    className="w-full"
                  >
                    Dividend at Year n
                  </Button>
                  <Button
                    onClick={() => handleCalculationTypeChange("dividendYield")}
                    variant={calculationType === "dividendYield" ? "default" : "outline"}
                    className="w-full"
                  >
                    Dividend Yield
                  </Button>
                  <Button
                    onClick={() => handleCalculationTypeChange("capitalGainYield")}
                    variant={calculationType === "capitalGainYield" ? "default" : "outline"}
                    className="w-full"
                  >
                    Capital Gain Yield
                  </Button>
                  <Button
                    onClick={() => handleCalculationTypeChange("ggm")}
                    variant={calculationType === "ggm" ? "default" : "outline"}
                    className="w-full"
                  >
                    Growth Perpetuity
                  </Button>
                  <Button
                    onClick={() => handleCalculationTypeChange("stockPricePerpetuity")}
                    variant={calculationType === "stockPricePerpetuity" ? "default" : "outline"}
                    className="w-full"
                  >
                    Price Perpetuity
                  </Button>
                </div>
                
                {calculationType === "ddm" && (
                  <>
                    <InputGroup
                      id="numberOfPeriods"
                      label="Number of Years"
                      value={numberOfPeriods}
                      onChange={setNumberOfPeriods}
                      type="number"
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useSingleDividend"
                        checked={useSingleDividend}
                        onCheckedChange={setUseSingleDividend}
                      />
                      <label htmlFor="useSingleDividend" className="text-sm">
                        Use the same dividend for all periods
                      </label>
                    </div>
                    {useSingleDividend ? (
                      <InputGroup
                        id="currentDividend"
                        label="Dividend (D₀)"
                        value={currentDividend}
                        onChange={setCurrentDividend}
                        type="number"
                        prefix="$"
                      />
                    ) : (
                      Array.from({ length: Number(numberOfPeriods) || 0 }).map((_, index) => (
                        <InputGroup
                          key={index}
                          id={`dividend${index + 1}`}
                          label={`Dividend Year ${index + 1} (D${index + 1})`}
                          value={dividends[index] || ""}
                          onChange={(value) => handleDividendChange(index, value)}
                          type="number"
                          prefix="$"
                        />
                      ))
                    )}
                    <InputGroup
                      id="futurePrice"
                      label="Future Price (Pn)"
                      value={futurePrice}
                      onChange={setFuturePrice}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="requiredRateOfReturn"
                      label="Required Rate of Return (r)"
                      value={requiredRateOfReturn}
                      onChange={setRequiredRateOfReturn}
                      type="number"
                      suffix="%"
                    />
                  </>
                )}
                {calculationType === "dividendYield" && (
                  <>
                    <InputGroup
                      id="currentDividend"
                      label="Current Dividend (D₀)"
                      value={currentDividend}
                      onChange={setCurrentDividend}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="currentPrice"
                      label="Current Price (P₀)"
                      value={currentPrice}
                      onChange={setCurrentPrice}
                      type="number"
                      prefix="$"
                    />
                  </>
                )}
                {calculationType === "capitalGainYield" && (
                  <>
                    <InputGroup
                      id="currentPrice"
                      label="Current Price (P₀)"
                      value={currentPrice}
                      onChange={setCurrentPrice}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="futurePrice"
                      label="Future Price (P₁)"
                      value={futurePrice}
                      onChange={setFuturePrice}
                      type="number"
                      prefix="$"
                    />
                  </>
                )}
                {calculationType === "ggm" && (
                  <>
                    <InputGroup
                      id="currentDividend"
                      label="Current Dividend (D₀)"
                      value={currentDividend}
                      onChange={setCurrentDividend}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="requiredRateOfReturn"
                      label="Required Rate of Return (r)"
                      value={requiredRateOfReturn}
                      onChange={setRequiredRateOfReturn}
                      type="number"
                      suffix="%"
                    />
                    <InputGroup
                      id="growthRate"
                      label="Growth Rate (g)"
                      value={growthRate}
                      onChange={setGrowthRate}
                      type="number"
                      suffix="%"
                    />
                  </>
                )}
                {calculationType === "dividendAtYearN" && (
                  <>
                    <InputGroup
                      id="currentDividend"
                      label="Current Dividend (D₀)"
                      value={currentDividend}
                      onChange={setCurrentDividend}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="growthRate"
                      label="Growth Rate (g)"
                      value={growthRate}
                      onChange={setGrowthRate}
                      type="number"
                      suffix="%"
                    />
                    <InputGroup
                      id="years"
                      label="Years (n)"
                      value={years}
                      onChange={setYears}
                      type="number"
                    />
                  </>
                )}
                {calculationType === "stockPricePerpetuity" && (
                  <>
                    <InputGroup
                      id="currentDividend"
                      label="Current Dividend (D₀)"
                      value={currentDividend}
                      onChange={setCurrentDividend}
                      type="number"
                      prefix="$"
                    />
                    <InputGroup
                      id="requiredRateOfReturn"
                      label="Required Rate of Return (r)"
                      value={requiredRateOfReturn}
                      onChange={setRequiredRateOfReturn}
                      type="number"
                      suffix="%"
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  The calculated value based on your inputs.
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
                          ? calculationType === "dividendYield" || calculationType === "capitalGainYield"
                            ? `${result.toFixed(2)}%`
                            : `$${result.toFixed(2)}`
                          : "—"}
                      </div>
                      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        {result !== null ? "Calculated Value" : "Enter all required inputs to see result"}
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
                <CardTitle className="text-white">Notes & Formulas</CardTitle>
                <CardDescription className="text-white">
                    Understanding dividend and capital gain calculations for stock evaluation.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                {/* Formulas Section */}
                <div className="rounded-lg bg-muted p-6">
                    <h3 className="text-lg font-semibold text-white">Key Formulas</h3>
                    <p className="mb-4 text-sm text-white">
                    The following formulas are essential for calculating stock values based on dividends and capital gains.
                    </p>

                    <ul className="space-y-3">
                    <li>
                        <strong className="font-medium text-white">Dividend Discount Model (DDM):</strong>
                        <p className="font-mono text-sm text-white">P₀ = D₁ / (r - g)</p>
                        <p className="text-sm text-white">This model values a stock by predicting future dividends and discounting them to the present.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Dividend Yield:</strong>
                        <p className="font-mono text-sm text-white">Dividend Yield = D₀ / P₀</p>
                        <p className="text-sm text-white">This represents the annual dividend payment as a percentage of the stock price.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Capital Gain Yield:</strong>
                        <p className="font-mono text-sm text-white">Capital Gain Yield = (P₁ - P₀) / P₀</p>
                        <p className="text-sm text-white">This measures the percentage increase in stock price over a period.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Gordon Growth Model (GGM):</strong>
                        <p className="font-mono text-sm text-white">P₀ = D₀ (1 + g) / (r - g)</p>
                        <p className="text-sm text-white">This model assumes that dividends grow at a constant rate, factoring in growth and required rate of return.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Dividend at Year N:</strong>
                        <p className="font-mono text-sm text-white">Dₙ = D₀ (1 + g)^n</p>
                        <p className="text-sm text-white">This calculates the dividend payment in year N, given a constant growth rate.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Zero Growth Dividend Discount Model:</strong>
                        <p className="font-mono text-sm text-white">P₀ = D₀ / r</p>
                        <p className="text-sm text-white">Assumes that dividends remain constant, useful for valuing preferred stocks.</p>
                    </li>
                    <li>
                        <strong className="font-medium text-white">Multi-Period DDM:</strong>
                        <p className="font-mono text-sm text-white">V₀ = Σ [Dₜ / (1+r)ᵗ] + Pₙ / (1+r)ⁿ</p>
                        <p className="text-sm text-white">This formula accounts for multiple periods, incorporating both dividends and the stock price at the end of the period.</p>
                    </li>
                    </ul>
                </div>

                {/* Key Insights Section */}
                <div className="flex items-start gap-3 rounded-lg bg-blue-950 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-400" />
                    <div>
                    <h3 className="font-semibold text-blue-300">Key Insights</h3>
                    <p className="mt-1 text-sm text-blue-200">
                        These models and formulas are crucial tools for investors to evaluate the intrinsic value of stocks based on future dividends and capital gains.
                    </p>
                    </div>
                </div>
                </CardContent>
            </Card>
            </TabsContent>

      </Tabs>
    </div>
  );
}