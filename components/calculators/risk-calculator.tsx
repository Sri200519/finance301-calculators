"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";

export function RiskCalculator() {
  // State for selecting which function to calculate.
  const [activeFunction, setActiveFunction] = useState("rateReturn");
  const [activeTab, setActiveTab] = useState("calculator");

  // ----------- Rate of Return -----------
  const [initialPrice, setInitialPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [dividend, setDividend] = useState("");
  const [rateOfReturn, setRateOfReturn] = useState<number | null>(null);

  const calculateRateOfReturn = () => {
    const P0 = Number(initialPrice);
    const P1 = Number(finalPrice);
    const D = Number(dividend);
    if (P0 > 0) {
      setRateOfReturn((D + (P1 - P0)) / P0);
    } else {
      setRateOfReturn(null);
    }
  };

  // ----------- Stock Risk Metrics -----------
  const [stockReturn1, setStockReturn1] = useState("");
  const [stockProb1, setStockProb1] = useState("");
  const [stockReturn2, setStockReturn2] = useState("");
  const [stockProb2, setStockProb2] = useState("");
  const [stockReturn3, setStockReturn3] = useState("");
  const [stockProb3, setStockProb3] = useState("");
  const [stockExpectedReturn, setStockExpectedReturn] = useState<number | null>(null);
  const [stockVariance, setStockVariance] = useState<number | null>(null);
  const [stockSD, setStockSD] = useState<number | null>(null);

  const calculateStockRisk = () => {
    // Convert probability inputs from percentage to decimal
    const r1 = Number(stockReturn1);
    const p1 = Number(stockProb1) / 100;
    const r2 = Number(stockReturn2);
    const p2 = Number(stockProb2) / 100;
    const r3 = Number(stockReturn3);
    const p3 = Number(stockProb3) / 100;
    const expReturn = r1 * p1 + r2 * p2 + r3 * p3;
    setStockExpectedReturn(expReturn);
    const variance =
      p1 * Math.pow(r1 - expReturn, 2) +
      p2 * Math.pow(r2 - expReturn, 2) +
      p3 * Math.pow(r3 - expReturn, 2);
    setStockVariance(variance);
    setStockSD(Math.sqrt(variance));
  };

  // ----------- Portfolio Proportion -----------
  const [assetValue, setAssetValue] = useState("");
  const [portfolioTotal, setPortfolioTotal] = useState("");
  const [portfolioProportion, setPortfolioProportion] = useState<number | null>(null);

  const calculatePortfolioProportion = () => {
    const asset = Number(assetValue);
    const total = Number(portfolioTotal);
    if (total > 0) {
      setPortfolioProportion(asset / total);
    } else {
      setPortfolioProportion(null);
    }
  };

  // ----------- Covariance between Stock & Market -----------
  const [covStockReturn1, setCovStockReturn1] = useState("");
  const [covMarketReturn1, setCovMarketReturn1] = useState("");
  const [covProb1, setCovProb1] = useState("");
  const [covStockReturn2, setCovStockReturn2] = useState("");
  const [covMarketReturn2, setCovMarketReturn2] = useState("");
  const [covProb2, setCovProb2] = useState("");
  const [covariance, setCovariance] = useState<number | null>(null);

  const calculateCovariance = () => {
    const s1 = Number(covStockReturn1);
    const m1 = Number(covMarketReturn1);
    const p1 = Number(covProb1) / 100;
    const s2 = Number(covStockReturn2);
    const m2 = Number(covMarketReturn2);
    const p2 = Number(covProb2) / 100;
    const expStock = s1 * p1 + s2 * p2;
    const expMarket = m1 * p1 + m2 * p2;
    const cov =
      p1 * ((s1 - expStock) * (m1 - expMarket)) +
      p2 * ((s2 - expStock) * (m2 - expMarket));
    setCovariance(cov);
  };

  // ----------- Calculation Effect Hooks -----------
  // These run calculations when inputs change
  useEffect(() => {
    if (activeFunction === "rateReturn" && initialPrice !== "" && finalPrice !== "" && dividend !== "") {
      calculateRateOfReturn();
    }
  }, [activeFunction, initialPrice, finalPrice, dividend]);

  useEffect(() => {
    if (
      activeFunction === "stockRisk" &&
      stockReturn1 !== "" &&
      stockProb1 !== "" &&
      stockReturn2 !== "" &&
      stockProb2 !== "" &&
      stockReturn3 !== "" &&
      stockProb3 !== ""
    ) {
      calculateStockRisk();
    }
  }, [activeFunction, stockReturn1, stockProb1, stockReturn2, stockProb2, stockReturn3, stockProb3]);

  useEffect(() => {
    if (activeFunction === "portfolioProportion" && assetValue !== "" && portfolioTotal !== "") {
      calculatePortfolioProportion();
    }
  }, [activeFunction, assetValue, portfolioTotal]);

  useEffect(() => {
    if (
      activeFunction === "covariance" &&
      covStockReturn1 !== "" &&
      covMarketReturn1 !== "" &&
      covProb1 !== "" &&
      covStockReturn2 !== "" &&
      covMarketReturn2 !== "" &&
      covProb2 !== ""
    ) {
      calculateCovariance();
    }
  }, [activeFunction, covStockReturn1, covMarketReturn1, covProb1, covStockReturn2, covMarketReturn2, covProb2]);

  // ----------- Local Storage Handling -----------
  // Load saved state on component mount
  // Add this constant at the top of the component
  const LOCAL_STORAGE_KEY = "riskCalculatorState";
  
  // Replace all localStorage handling code with this updated version
  useEffect(() => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setActiveFunction(parsed.activeFunction || "rateReturn");
      setActiveTab(parsed.activeTab || "calculator");
      setInitialPrice(parsed.initialPrice ?? "");
      setFinalPrice(parsed.finalPrice ?? "");
      setDividend(parsed.dividend ?? "");
      setStockReturn1(parsed.stockReturn1 ?? "");
      setStockProb1(parsed.stockProb1 ?? "");
      setStockReturn2(parsed.stockReturn2 ?? "");
      setStockProb2(parsed.stockProb2 ?? "");
      setStockReturn3(parsed.stockReturn3 ?? "");
      setStockProb3(parsed.stockProb3 ?? "");
      setAssetValue(parsed.assetValue ?? "");
      setPortfolioTotal(parsed.portfolioTotal ?? "");
      setCovStockReturn1(parsed.covStockReturn1 ?? "");
      setCovMarketReturn1(parsed.covMarketReturn1 ?? "");
      setCovProb1(parsed.covProb1 ?? "");
      setCovStockReturn2(parsed.covStockReturn2 ?? "");
      setCovMarketReturn2(parsed.covMarketReturn2 ?? "");
      setCovProb2(parsed.covProb2 ?? "");
    }
  } catch (error) {
    console.error("Error loading saved state:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}, []);

// Update the save effect
useEffect(() => {
  const stateToSave = {
    activeFunction,
    activeTab,
    initialPrice,
    finalPrice,
    dividend,
    stockReturn1,
    stockProb1,
    stockReturn2,
    stockProb2,
    stockReturn3,
    stockProb3,
    assetValue,
    portfolioTotal,
    covStockReturn1,
    covMarketReturn1,
    covProb1,
    covStockReturn2,
    covMarketReturn2,
    covProb2
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
}, [
  activeFunction, activeTab, initialPrice, finalPrice, dividend,
  stockReturn1, stockProb1, stockReturn2, stockProb2, stockReturn3, stockProb3,
  assetValue, portfolioTotal,
  covStockReturn1, covMarketReturn1, covProb1, covStockReturn2, covMarketReturn2, covProb2
]);

// Update the reset handler
const handleReset = () => {
  // Reset all states with defaults
  setActiveFunction("rateReturn");
  setActiveTab("calculator");
  setInitialPrice("");
  setFinalPrice("");
  setDividend("");
  setRateOfReturn(null);
  
  setStockReturn1("");
  setStockProb1("");
  setStockReturn2("");
  setStockProb2("");
  setStockReturn3("");
  setStockProb3("");
  setStockExpectedReturn(null);
  setStockVariance(null);
  setStockSD(null);

  setAssetValue("");
  setPortfolioTotal("");
  setPortfolioProportion(null);

  setCovStockReturn1("");
  setCovMarketReturn1("");
  setCovProb1("");
  setCovStockReturn2("");
  setCovMarketReturn2("");
  setCovProb2("");
  setCovariance(null);
  
  // Remove saved state
  localStorage.removeItem("riskCalculatorState");
};

  // ----------- Render Input Fields -----------
  const renderInputs = () => {
    switch (activeFunction) {
      case "rateReturn":
        return (
          <div className="space-y-4">
            <InputGroup id="initialPrice" label="Initial Price" value={initialPrice} onChange={setInitialPrice} type="text" prefix="$" />
            <InputGroup id="finalPrice" label="Final Price" value={finalPrice} onChange={setFinalPrice} type="text" prefix="$" />
            <InputGroup id="dividend" label="Dividend" value={dividend} onChange={setDividend} type="text" prefix="$" />
          </div>
        );
      case "stockRisk":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <InputGroup id="stockReturn1" label="Return State 1" value={stockReturn1} onChange={setStockReturn1} type="text" />
              <InputGroup id="stockProb1" label="Probability 1" value={stockProb1} onChange={setStockProb1} type="text" suffix="%" />
              <InputGroup id="stockReturn2" label="Return State 2" value={stockReturn2} onChange={setStockReturn2} type="text" />
              <InputGroup id="stockProb2" label="Probability 2" value={stockProb2} onChange={setStockProb2} type="text" suffix="%" />
              <InputGroup id="stockReturn3" label="Return State 3" value={stockReturn3} onChange={setStockReturn3} type="text" />
              <InputGroup id="stockProb3" label="Probability 3" value={stockProb3} onChange={setStockProb3} type="text" suffix="%" />
            </div>
          </div>
        );
      case "portfolioProportion":
        return (
          <div className="space-y-4">
            <InputGroup id="assetValue" label="Asset Value" value={assetValue} onChange={setAssetValue} type="text" prefix="$" />
            <InputGroup id="portfolioTotal" label="Total Portfolio Value" value={portfolioTotal} onChange={setPortfolioTotal} type="text" prefix="$" />
          </div>
        );
      case "covariance":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <InputGroup id="covStockReturn1" label="Stock Return 1" value={covStockReturn1} onChange={setCovStockReturn1} type="text" />
              <InputGroup id="covMarketReturn1" label="Market Return 1" value={covMarketReturn1} onChange={setCovMarketReturn1} type="text" />
              <InputGroup id="covProb1" label="Probability 1" value={covProb1} onChange={setCovProb1} type="text" suffix="%" />
              <InputGroup id="covStockReturn2" label="Stock Return 2" value={covStockReturn2} onChange={setCovStockReturn2} type="text" />
              <InputGroup id="covMarketReturn2" label="Market Return 2" value={covMarketReturn2} onChange={setCovMarketReturn2} type="text" />
              <InputGroup id="covProb2" label="Probability 2" value={covProb2} onChange={setCovProb2} type="text" suffix="%" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // ----------- Render Output -----------
  const renderOutput = () => {
    switch (activeFunction) {
      case "rateReturn":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Rate of Return</div>
            <div className="text-3xl font-bold">
              {rateOfReturn !== null ? `${(rateOfReturn * 100).toFixed(2)}%` : "—"}
            </div>
          </div>
        );
      case "stockRisk":
        return (
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Expected Return:</span>
              <span className="text-lg font-medium">
                {stockExpectedReturn !== null ? `${(stockExpectedReturn * 100).toFixed(2)}%` : "—"}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Variance:</span>
              <span className="text-lg font-medium">
                {stockVariance !== null ? stockVariance.toFixed(4) : "—"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Standard Deviation:</span>
              <span className="text-lg font-medium">
                {stockSD !== null ? stockSD.toFixed(4) : "—"}
              </span>
            </div>
          </div>
        );
      case "portfolioProportion":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Portfolio Weight</div>
            <div className="text-3xl font-bold">
              {portfolioProportion !== null ? `${(portfolioProportion * 100).toFixed(2)}%` : "—"}
            </div>
          </div>
        );
      case "covariance":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">Covariance</div>
            <div className="text-3xl font-bold">
              {covariance !== null ? covariance.toFixed(4) : "—"}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Global Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate various risk metrics including rate of return, stock risk, portfolio proportion, and covariance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes & Formulas</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          {/* Main Calculator Card */}
          <Card className="grid md:grid-cols-2 gap-6">
            {/* Left: Input area with function buttons */}
            <div className="space-y-4 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Select a calculation type and enter your values</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant={activeFunction === "rateReturn" ? "default" : "outline"} onClick={() => setActiveFunction("rateReturn")}>
                  Rate of Return
                </Button>
                <Button variant={activeFunction === "stockRisk" ? "default" : "outline"} onClick={() => setActiveFunction("stockRisk")}>
                  Stock/Market Risk
                </Button>
                <Button variant={activeFunction === "portfolioProportion" ? "default" : "outline"} onClick={() => setActiveFunction("portfolioProportion")}>
                  Portfolio Proportion
                </Button>
                <Button variant={activeFunction === "covariance" ? "default" : "outline"} onClick={() => setActiveFunction("covariance")}>
                  Covariance
                </Button>
              </div>
              {renderInputs()}
            </div>

            {/* Right: Output area */}
            <div className="border-l p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {activeFunction === "rateReturn" && "The rate of return on your investment"}
                  {activeFunction === "stockRisk" && "Stock risk metrics based on your inputs"}
                  {activeFunction === "portfolioProportion" && "The proportion of your asset in the portfolio"}
                  {activeFunction === "covariance" && "The covariance between stock and market returns"}
                </CardDescription>
              </CardHeader>
              <div className="flex h-full flex-col items-center justify-center py-6">
                <div className="w-full">
                  {renderOutput()}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Formulas</CardTitle>
              <CardDescription>Review the formulas and key insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Formulas</h3>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Rate of Return</strong>: (Dividend + (Final Price - Initial Price)) / Initial Price
                  </li>
                  <li>
                    <strong>Expected Return</strong>: Σ (Probability × Return)
                  </li>
                  <li>
                    <strong>Variance</strong>: Σ (Probability × (Return - Expected Return)²)
                  </li>
                  <li>
                    <strong>Standard Deviation</strong>: √Variance
                  </li>
                  <li>
                    <strong>Portfolio Proportion</strong>: Asset Value / Total Portfolio Value
                  </li>
                  <li>
                    <strong>Covariance</strong>: Σ (Probability × (Stock Return - Stock Expected Return) × (Market Return - Market Expected Return))
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>Probabilities should be entered as percentages (e.g., 33 for 33%) and should sum to 100% within each metric.</li>
                    <li>For covariance, expected returns are computed using the two state probabilities.</li>
                    <li>Standard deviation is a measure of risk - higher values indicate greater volatility.</li>
                    <li>Covariance measures how two variables move together - positive values indicate they move in the same direction.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Common Applications</h3>
                <p className="mb-4 text-sm">
                  Risk metrics are used in various financial scenarios:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Portfolio Management</strong>: Assessing risk and return characteristics of investments.
                  </li>
                  <li>
                    <strong>Asset Allocation</strong>: Determining optimal portfolio weights based on risk preferences.
                  </li>
                  <li>
                    <strong>Performance Evaluation</strong>: Measuring investment performance relative to risk taken.
                  </li>
                  <li>
                    <strong>Risk Management</strong>: Identifying and mitigating potential sources of financial risk.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}