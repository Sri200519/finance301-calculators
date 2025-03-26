"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.log(error);
        return initialValue;
      }
    });
  
    const setValue = (value: T) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    return [storedValue, setValue];
  }

function ProfitLossChart({ 
  data, 
  referencePrice, 
  currentPrice, 
  label 
}: { 
  data: { price: number; value: number }[]; 
  referencePrice: number;
  currentPrice: number;
  label: string;
}) {
  const { minPrice, maxPrice, minValue, maxValue } = useMemo(() => {
    const prices = data.map(d => d.price);
    const values = data.map(d => d.value);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [data]);

  const adjustedMinValue = Math.min(minValue, 0);
  const adjustedMaxValue = Math.max(maxValue, 0);

  const getY = (value: number) => {
    const range = adjustedMaxValue - adjustedMinValue;
    if (range === 0) return 100;
    return 200 - ((value - adjustedMinValue) / range) * 180;
  };

  const getX = (price: number) => {
    const range = maxPrice - minPrice;
    if (range === 0) return 20;
    return 20 + ((price - minPrice) / range) * 360;
  };

  const pathData = useMemo(() => {
    if (data.length === 0) return "";

    let path = `M ${getX(data[0].price)} ${getY(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${getX(data[i].price)} ${getY(data[i].value)}`;
    }
    return path;
  }, [data]);

  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
      <line x1="20" y1="200" x2="380" y2="200" stroke="#ccc" strokeWidth="1" />
      <line x1="20" y1="20" x2="20" y2="200" stroke="#ccc" strokeWidth="1" />

      {[minPrice, referencePrice, currentPrice, maxPrice].filter(price => !isNaN(price)).map((price, i) => (
        <g key={`x-${i}`}>
          <line x1={getX(price)} y1="200" x2={getX(price)} y2="205" stroke="#666" strokeWidth="1" />
          <text x={getX(price)} y="215" textAnchor="middle" fontSize="10" fill="#666">
            {price.toFixed(2)}
          </text>
        </g>
      ))}

      {[adjustedMinValue, 0, adjustedMaxValue].filter(value => !isNaN(value)).map((value, i) => (
        <g key={`y-${i}`}>
          <line x1="15" y1={getY(value)} x2="20" y2={getY(value)} stroke="#666" strokeWidth="1" />
          <text x="10" y={getY(value) + 4} textAnchor="end" fontSize="10" fill="#666">
            {value.toFixed(0)}
          </text>
        </g>
      ))}

      <line x1="20" y1={getY(0)} x2="380" y2={getY(0)} stroke="#888" strokeWidth="1" strokeDasharray="4,4" />
      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" />

      {!isNaN(referencePrice) && (
        <>
          <line x1={getX(referencePrice)} y1="20" x2={getX(referencePrice)} y2="200" 
                stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
          <text x={getX(referencePrice)} y="15" textAnchor="middle" fontSize="10" fill="#ef4444">
            {label}
          </text>
        </>
      )}

      {!isNaN(currentPrice) && currentPrice >= minPrice && currentPrice <= maxPrice && (
        <>
          <line x1={getX(currentPrice)} y1="20" x2={getX(currentPrice)} y2="200" 
                stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" />
          <text x={getX(currentPrice)} y="15" textAnchor="middle" fontSize="10" fill="#10b981">
            Current
          </text>
        </>
      )}

      <text x="390" y="200" textAnchor="end" fontSize="10" fill="#666">Underlying Price</text>
      <text x="10" y="10" textAnchor="start" fontSize="10" fill="#666" 
            transform="rotate(-90, 10, 10) translate(-100, 0)">Profit/Loss ($)</text>
    </svg>
  );
}

export function TradingCalculator() {
    const [calcType, setCalcType] = useLocalStorage<"call" | "put" | "long" | "short" | "straddle">("calcType", "call");
  const [position, setPosition] = useLocalStorage<"buy" | "sell">("position", "buy");
  
  // Common state with local storage
  const [entryPrice, setEntryPrice] = useLocalStorage<string>("entryPrice", "");
  const [currentPrice, setCurrentPrice] = useLocalStorage<string>("currentPrice", "");
  const [quantity, setQuantity] = useLocalStorage<string>("quantity", "1");
  const [strikePrice, setStrikePrice] = useLocalStorage<string>("strikePrice", "");
  const [premium, setPremium] = useLocalStorage<string>("premium", "");
  const [putPremium, setPutPremium] = useLocalStorage<string>("putPremium", "");
  const [callPremium, setCallPremium] = useLocalStorage<string>("callPremium", "");
  const [activeTab, setActiveTab] = useLocalStorage<string>("activeTab", "calculator");

  // Non-stored states
  const [result, setResult] = useState<number | null>(null);
  const [breakEven, setBreakEven] = useState<{ upper: number | null; lower: number | null }>({ upper: null, lower: null });
  const [maxProfit, setMaxProfit] = useState<number | null>(null);
  const [maxLoss, setMaxLoss] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ price: number; value: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Validation function
  const validateInputs = () => {
    const isCurrentValid = !isNaN(Number(currentPrice)) && Number(currentPrice) >= 0;
    const isQuantityValid = !isNaN(Number(quantity)) && Number(quantity) > 0;

    if (!isCurrentValid) {
      setError("Please enter a valid current price.");
      return false;
    }
    if (!isQuantityValid) {
      setError("Please enter a valid quantity.");
      return false;
    }

    if (calcType === "call" || calcType === "put") {
      const isStrikeValid = !isNaN(Number(strikePrice)) && Number(strikePrice) > 0;
      const isPremiumValid = !isNaN(Number(premium)) && Number(premium) >= 0;
      
      if (!isStrikeValid) {
        setError("Please enter a valid strike price.");
        return false;
      }
      if (!isPremiumValid) {
        setError("Please enter a valid option premium.");
        return false;
      }
    } else if (calcType === "straddle") {
      const isStrikeValid = !isNaN(Number(strikePrice)) && Number(strikePrice) > 0;
      const isPutPremiumValid = !isNaN(Number(putPremium)) && Number(putPremium) >= 0;
      const isCallPremiumValid = !isNaN(Number(callPremium)) && Number(callPremium) >= 0;
      
      if (!isStrikeValid) {
        setError("Please enter a valid strike price.");
        return false;
      }
      if (!isPutPremiumValid || !isCallPremiumValid) {
        setError("Please enter valid put and call premiums.");
        return false;
      }
    } else {
      const isEntryValid = !isNaN(Number(entryPrice)) && Number(entryPrice) > 0;
      if (!isEntryValid) {
        setError("Please enter a valid entry price.");
        return false;
      }
    }

    setError(null);
    return true;
  };
  
    useEffect(() => {
      if (
        (currentPrice !== "" && quantity !== "" && 
        ((calcType === "call" || calcType === "put") ? (strikePrice !== "" && premium !== "") : 
         calcType === "straddle" ? (strikePrice !== "" && putPremium !== "" && callPremium !== "") : 
         entryPrice !== ""))
      ) {
        if (validateInputs()) {
          calculatePosition();
        }
      } else {
        setResult(null);
        setBreakEven({ upper: null, lower: null });
        setMaxProfit(null);
        setMaxLoss(null);
        setChartData([]);
        setError(null);
      }
    }, [calcType, position, entryPrice, currentPrice, quantity, strikePrice, premium, putPremium, callPremium]);
  
    const calculatePosition = () => {
      try {
        const S = Number(currentPrice);
        const qty = Number(quantity);
        let profitLoss = 0;
        let beUpper = 0;
        let beLower = 0;
        let mp = 0;
        let ml = 0;
  
        if (calcType === "call") {
          const K = Number(strikePrice);
          const P = Number(premium);
          if (position === "buy") {
            profitLoss = (Math.max(S - K, 0) - P) * qty;
            beUpper = K + P;
            mp = Infinity;
            ml = P * qty;
          } else {
            profitLoss = (P - Math.max(S - K, 0)) * qty;
            beUpper = K + P;
            mp = P * qty;
            ml = Infinity;
          }
        } 
        else if (calcType === "put") {
          const K = Number(strikePrice);
          const P = Number(premium);
          if (position === "buy") {
            profitLoss = (Math.max(K - S, 0) - P) * qty;
            beLower = K - P;
            mp = (K - P) * qty;
            ml = P * qty;
          } else {
            profitLoss = (P - Math.max(K - S, 0)) * qty;
            beLower = K - P;
            mp = P * qty;
            ml = (K - P) * qty;
          }
        }
        else if (calcType === "straddle") {
          const K = Number(strikePrice);
          const putP = Number(putPremium);
          const callP = Number(callPremium);
          const totalPremium = putP + callP;
          
          if (position === "buy") {
            const callProfit = Math.max(S - K, 0) - callP;
            const putProfit = Math.max(K - S, 0) - putP;
            profitLoss = (callProfit + putProfit) * qty;
            beUpper = K + totalPremium;
            beLower = K - totalPremium;
            mp = Infinity; // Unlimited profit if stock moves significantly in either direction
            ml = totalPremium * qty; // Max loss if stock at strike at expiration
          } else {
            const callProfit = callP - Math.max(S - K, 0);
            const putProfit = putP - Math.max(K - S, 0);
            profitLoss = (callProfit + putProfit) * qty;
            beUpper = K + totalPremium;
            beLower = K - totalPremium;
            mp = totalPremium * qty; // Max profit if stock at strike at expiration
            ml = Infinity; // Unlimited loss if stock moves significantly in either direction
          }
        }
        else if (calcType === "long") {
          const entry = Number(entryPrice);
          profitLoss = (S - entry) * qty;
          beUpper = entry;
          mp = Infinity;
          ml = entry * qty;
        }
        else if (calcType === "short") {
          const entry = Number(entryPrice);
          profitLoss = (entry - S) * qty;
          beUpper = entry;
          mp = entry * qty;
          ml = Infinity;
        }
  
        setResult(profitLoss);
        setBreakEven({ upper: beUpper, lower: beLower });
        setMaxProfit(mp);
        setMaxLoss(ml);
        generateChartData();
      } catch (error) {
        console.error("Calculation error:", error);
        setError("An error occurred during calculation. Please check your inputs.");
        setResult(null);
        setBreakEven({ upper: null, lower: null });
        setMaxProfit(null);
        setMaxLoss(null);
        setChartData([]);
      }
    };
  
    const generateChartData = () => {
      const dataPoints = 50;
      let minPrice = 0;
      let maxPrice = 0;
      let referencePrice = 0;
      
      if (calcType === "call" || calcType === "put" || calcType === "straddle") {
        referencePrice = Number(strikePrice);
        minPrice = Math.max(0, referencePrice * 0.7);
        maxPrice = referencePrice * 1.3;
      } else {
        referencePrice = Number(entryPrice);
        minPrice = Math.max(0, referencePrice * 0.7);
        maxPrice = referencePrice * 1.3;
      }
      
      const step = (maxPrice - minPrice) / dataPoints;
      const data = [];
      
      for (let price = minPrice; price <= maxPrice; price += step) {
        let value = 0;
        
        if (calcType === "call") {
          const K = Number(strikePrice);
          const P = Number(premium);
          value = position === "buy" 
            ? (Math.max(price - K, 0) - P) * Number(quantity)
            : (P - Math.max(price - K, 0)) * Number(quantity);
        } 
        else if (calcType === "put") {
          const K = Number(strikePrice);
          const P = Number(premium);
          value = position === "buy"
            ? (Math.max(K - price, 0) - P) * Number(quantity)
            : (P - Math.max(K - price, 0)) * Number(quantity);
        }
        else if (calcType === "straddle") {
          const K = Number(strikePrice);
          const putP = Number(putPremium);
          const callP = Number(callPremium);
          
          if (position === "buy") {
            const callValue = Math.max(price - K, 0) - callP;
            const putValue = Math.max(K - price, 0) - putP;
            value = (callValue + putValue) * Number(quantity);
          } else {
            const callValue = callP - Math.max(price - K, 0);
            const putValue = putP - Math.max(K - price, 0);
            value = (callValue + putValue) * Number(quantity);
          }
        }
        else if (calcType === "long") {
          const entry = Number(entryPrice);
          value = (price - entry) * Number(quantity);
        }
        else if (calcType === "short") {
          const entry = Number(entryPrice);
          value = (entry - price) * Number(quantity);
        }
        
        data.push({
          price: parseFloat(price.toFixed(2)),
          value: parseFloat(value.toFixed(2))
        });
      }
      
      setChartData(data);
    };
  
    const handleReset = () => {
      setCalcType("call");
      setPosition("buy");
      setEntryPrice("");
      setCurrentPrice("");
      setQuantity("1");
      setStrikePrice("");
      setPremium("");
      setPutPremium("");
      setCallPremium("");
      setResult(null);
      setBreakEven({ upper: null, lower: null });
      setMaxProfit(null);
      setMaxLoss(null);
      setChartData([]);
      setError(null);
      localStorage.removeItem("tradingCalculatorState");
    };

    const getOptionStatus = (calcType: string, currentPrice: number, strikePrice: number) => {
      if (isNaN(currentPrice)) return null;
      if (isNaN(strikePrice)) return null;
      if (calcType !== "call" && calcType !== "put") return null;
      
      if (calcType === "call") {
        return currentPrice > strikePrice ? "In the Money" : "Out of the Money";
      } else if (calcType === "put") {
        return currentPrice < strikePrice ? "In the Money" : "Out of the Money";
      }
      return null;
    };
  
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Calculator</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Calculate profit/loss for options and stock positions.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> Reset
          </Button>
        </div>
  
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="notes">Notes & Concepts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inputs</CardTitle>
                  <CardDescription>
                    {calcType === "call" ? "Call option details" :
                     calcType === "put" ? "Put option details" :
                     calcType === "straddle" ? "Straddle details" :
                     calcType === "long" ? "Long position details" : "Short position details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position Type:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={calcType === "call" ? "default" : "outline"}
                        onClick={() => setCalcType("call")}
                        className="w-full"
                      >
                        Call
                      </Button>
                      <Button
                        variant={calcType === "put" ? "default" : "outline"}
                        onClick={() => setCalcType("put")}
                        className="w-full"
                      >
                        Put
                      </Button>
                      <Button
                        variant={calcType === "straddle" ? "default" : "outline"}
                        onClick={() => setCalcType("straddle")}
                        className="w-full"
                      >
                        Straddle
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={calcType === "long" ? "default" : "outline"}
                        onClick={() => setCalcType("long")}
                        className="w-full"
                      >
                        Buy Long
                      </Button>
                      <Button
                        variant={calcType === "short" ? "default" : "outline"}
                        onClick={() => setCalcType("short")}
                        className="w-full"
                      >
                        Sell Short
                      </Button>
                    </div>
                  </div>
  
                  {(calcType === "call" || calcType === "put" || calcType === "straddle") && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={position === "buy" ? "default" : "outline"}
                        onClick={() => setPosition("buy")}
                        className="w-full"
                      >
                        Buy
                      </Button>
                      <Button
                        variant={position === "sell" ? "default" : "outline"}
                        onClick={() => setPosition("sell")}
                        className="w-full"
                      >
                        Write
                      </Button>
                    </div>
                  )}
  
                  {(calcType === "call" || calcType === "put" || calcType === "straddle") && (
                    <InputGroup
                      id="strikePrice"
                      label="Strike Price"
                      value={strikePrice}
                      onChange={setStrikePrice}
                      type="text"
                      prefix="$"
                    />
                  )}
  
                  {calcType === "call" && (
                    <InputGroup
                      id="premium"
                      label="Call Premium"
                      value={premium}
                      onChange={setPremium}
                      type="text"
                      prefix="$"
                    />
                  )}
  
                  {calcType === "put" && (
                    <InputGroup
                      id="premium"
                      label="Put Premium"
                      value={premium}
                      onChange={setPremium}
                      type="text"
                      prefix="$"
                    />
                  )}
  
                  {calcType === "straddle" && (
                    <>
                      <InputGroup
                        id="callPremium"
                        label="Call Premium"
                        value={callPremium}
                        onChange={setCallPremium}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id="putPremium"
                        label="Put Premium"
                        value={putPremium}
                        onChange={setPutPremium}
                        type="text"
                        prefix="$"
                      />
                    </>
                  )}
  
                  {(calcType === "long" || calcType === "short") && (
                    <InputGroup
                      id="entryPrice"
                      label="Entry Price"
                      value={entryPrice}
                      onChange={setEntryPrice}
                      type="text"
                      prefix="$"
                    />
                  )}
  
                  <InputGroup
                    id="currentPrice"
                    label="Current Price"
                    value={currentPrice}
                    onChange={setCurrentPrice}
                    type="text"
                    prefix="$"
                  />
  
                  <InputGroup
                    id="quantity"
                    label={calcType === "call" || calcType === "put" || calcType === "straddle" ? "Contracts" : "Shares"}
                    value={quantity}
                    onChange={setQuantity}
                    type="text"
                  />
                </CardContent>
              </Card>
  
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    {position === "buy" ? "Buy" : "Sell"} {calcType === "call" ? "call option" :
                    calcType === "put" ? "put option" :
                    calcType === "straddle" ? "straddle" :
                    calcType === "long" ? "long position" : "short position"} analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Profit/Loss</p>
                      <p className={`text-2xl font-bold ${result !== null ? (result >= 0 ? "text-green-600" : "text-red-600") : ""}`}>
                        {result !== null ? `$${result.toFixed(2)}` : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Break-even</p>
                      <p className="text-2xl font-bold">
                        {breakEven.upper !== null && breakEven.lower !== null ? 
                          (calcType === "straddle" ? 
                            `$${breakEven.lower.toFixed(2)} / $${breakEven.upper.toFixed(2)}` : 
                            `$${calcType === "put" ? breakEven.lower?.toFixed(2) : breakEven.upper?.toFixed(2)}`) : 
                          "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Max Profit</p>
                      <p className="text-2xl font-bold">
                        {maxProfit !== null ? (maxProfit === Infinity ? "∞" : `$${maxProfit.toFixed(2)}`) : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Max Loss</p>
                      <p className="text-2xl font-bold">
                        {maxLoss !== null ? (maxLoss === Infinity ? "∞" : `$${maxLoss.toFixed(2)}`) : "—"}
                      </p>
                    </div>
                    {/* Only show option status when all conditions are met */}
                    {(calcType === "call" || calcType === "put") && 
                      currentPrice && !isNaN(Number(currentPrice)) && 
                      strikePrice && !isNaN(Number(strikePrice)) && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Option Status</p>
                          <p className="text-2xl font-bold">
                            {Number(currentPrice) > Number(strikePrice) && calcType === "call" ? "In the Money" : 
                            Number(currentPrice) < Number(strikePrice) && calcType === "put" ? "In the Money" : 
                            "Out of the Money"}
                          </p>
                        </div>
                      )}
                    </div>
                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

  
                <Card>
                  <CardHeader>
                    <CardTitle>Profit/Loss Chart</CardTitle>
                    <CardDescription>Visualization of potential outcomes</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    {chartData.length > 0 ? (
                      <ProfitLossChart 
                        data={chartData} 
                        referencePrice={
                          calcType === "call" || calcType === "put" || calcType === "straddle" ? Number(strikePrice) : Number(entryPrice)
                        } 
                        currentPrice={Number(currentPrice)} 
                        label={calcType === "call" || calcType === "put" || calcType === "straddle" ? "Strike" : "Entry"}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Enter valid inputs to see the chart
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
  
          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Concepts</CardTitle>
                <CardDescription>Understanding different position types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-semibold">Key Concepts</h3>
                  <ul className="ml-6 list-disc space-y-2">
                    <li><strong>Buy Call</strong>: Right to buy stock at strike price. Profit when stock rises above strike + premium.</li>
                    <li><strong>Write Call</strong>: Obligation to sell stock at strike price. Profit when stock stays below strike + premium.</li>
                    <li><strong>Buy Put</strong>: Right to sell stock at strike price. Profit when stock falls below strike - premium.</li>
                    <li><strong>Write Put</strong>: Obligation to buy stock at strike price. Profit when stock stays above strike - premium.</li>
                    <li><strong>Buy Straddle</strong>: Buying both a call and put at same strike. Profit when stock moves significantly in either direction.</li>
                    <li><strong>Write Straddle</strong>: Selling both a call and put at same strike. Profit when stock stays near the strike price.</li>
                    <li><strong>Long Stock</strong>: Buying stock expecting price increase. Profit when price rises.</li>
                    <li><strong>Short Stock</strong>: Selling borrowed stock expecting price decrease. Profit when price falls.</li>
                  </ul>
                </div>
  
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">Profit/Loss Formulas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Buy Call</h4>
                      <p className="font-mono text-sm">(Max(0, Current - Strike) - Premium) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Unlimited</p>
                      <p className="text-sm">Max Loss: Premium Paid</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Sell Call</h4>
                      <p className="font-mono text-sm">(Premium - Max(0, Current - Strike)) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Premium Received</p>
                      <p className="text-sm">Max Loss: Unlimited</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Buy Put</h4>
                      <p className="font-mono text-sm">(Max(0, Strike - Current) - Premium) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Strike - Premium</p>
                      <p className="text-sm">Max Loss: Premium Paid</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Sell Put</h4>
                      <p className="font-mono text-sm">(Premium - Max(0, Strike - Current)) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Premium Received</p>
                      <p className="text-sm">Max Loss: Strike - Premium</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Buy Straddle</h4>
                      <p className="font-mono text-sm">(Max(0, Current - Strike) - CallP + Max(0, Strike - Current) - PutP) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Unlimited (both directions)</p>
                      <p className="text-sm">Max Loss: Total Premium Paid</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Sell Straddle</h4>
                      <p className="font-mono text-sm">(CallP - Max(0, Current - Strike) + PutP - Max(0, Strike - Current)) × Contracts</p>
                      <p className="mt-1 text-sm">Max Profit: Total Premium Received</p>
                      <p className="text-sm">Max Loss: Unlimited (both directions)</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Long Stock</h4>
                      <p className="font-mono text-sm">(Current - Entry) × Shares</p>
                      <p className="mt-1 text-sm">Max Profit: Unlimited</p>
                      <p className="text-sm">Max Loss: Entry × Shares</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Short Stock</h4>
                      <p className="font-mono text-sm">(Entry - Current) × Shares</p>
                      <p className="mt-1 text-sm">Max Profit: Entry × Shares</p>
                      <p className="text-sm">Max Loss: Unlimited</p>
                    </div>
                  </div>
                </div>
  
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-semibold">Example Trades</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Buy Call:</p>
                      <p className="text-sm">Buy 1 $100 call @ $5 premium</p>
                      <p className="text-sm">Stock at $110: ($110 - $100 - $5) × 1 = $5 profit</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Sell Call:</p>
                      <p className="text-sm">Sell 1 $100 call @ $5 premium</p>
                      <p className="text-sm">Stock at $90: $5 profit (full premium)</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Buy Put:</p>
                      <p className="text-sm">Buy 1 $100 put @ $5 premium</p>
                      <p className="text-sm">Stock at $90: ($100 - $90 - $5) × 1 = $5 profit</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Sell Put:</p>
                      <p className="text-sm">Sell 1 $100 put @ $5 premium</p>
                      <p className="text-sm">Stock at $110: $5 profit (full premium)</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Buy Straddle:</p>
                      <p className="text-sm">Buy 1 $100 call @ $5 and 1 $100 put @ $5</p>
                      <p className="text-sm">Stock at $110: ($110 - $100 - $5) + ($0 - $5) = $0</p>
                      <p className="text-sm">Stock at $90: ($0 - $5) + ($100 - $90 - $5) = $0</p>
                      <p className="text-sm">Stock at $120: ($120 - $100 - $5) + ($0 - $5) = $10 profit</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Sell Straddle:</p>
                      <p className="text-sm">Sell 1 $100 call @ $5 and 1 $100 put @ $5</p>
                      <p className="text-sm">Stock at $100: $5 + $5 = $10 profit (full premium)</p>
                      <p className="text-sm">Stock at $110: ($5 - $10) + ($5 - $0) = $0</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Long Stock:</p>
                      <p className="text-sm">Buy 100 shares @ $50</p>
                      <p className="text-sm">Stock at $60: ($60 - $50) × 100 = $1,000 profit</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Short Stock:</p>
                      <p className="text-sm">Short 100 shares @ $50</p>
                      <p className="text-sm">Stock at $40: ($50 - $40) × 100 = $1,000 profit</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }