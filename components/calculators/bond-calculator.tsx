"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CouponBondCalculator() {
  // State for inputs
  const [annualCouponPercentage, setAnnualCouponPercentage] = useState<string>("");
  const [couponPayment, setCouponPayment] = useState<string>("");
  const [ytm, setYtm] = useState<string>("");
  const [bondPrice, setBondPrice] = useState<string>("");
  const [faceValue, setFaceValue] = useState<string>("");
  const [numPeriods, setNumPeriods] = useState<string>("");

  // State for coupon input type
  const [useCouponPayment, setUseCouponPayment] = useState<boolean>(false);

  // State for compound frequency
  const [compoundFrequency, setCompoundFrequency] = useState<"yearly" | "semiannually" | "quarterly" | "monthly" | "custom">("yearly");
  const [customFrequency, setCustomFrequency] = useState<string>("");

  // State for result
  const [result, setResult] = useState<number | null>(null);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for selected calculation type
  const [calculationType, setCalculationType] = useState<
    "bondPrice" | "ytm" | "faceValue" | "annualCouponPercentage" | "couponPayment" | "zeroCouponPrice" | "zeroCouponYTM"
  >("bondPrice");

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('bondCalculatorData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAnnualCouponPercentage(parsedData.annualCouponPercentage || "");
        setCouponPayment(parsedData.couponPayment || "");
        setYtm(parsedData.ytm || "");
        setBondPrice(parsedData.bondPrice || "");
        setFaceValue(parsedData.faceValue || "");
        setNumPeriods(parsedData.numPeriods || "");
        setCompoundFrequency(parsedData.compoundFrequency || "yearly");
        setCustomFrequency(parsedData.customFrequency || "");
        setCalculationType(parsedData.calculationType || "bondPrice");
        setUseCouponPayment(parsedData.useCouponPayment || false);
      }
    }
  }, []);

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToSave = {
        annualCouponPercentage,
        couponPayment,
        ytm,
        bondPrice,
        faceValue,
        numPeriods,
        compoundFrequency,
        customFrequency,
        calculationType,
        useCouponPayment
      };
      localStorage.setItem('bondCalculatorData', JSON.stringify(dataToSave));
    }
  }, [
    annualCouponPercentage, 
    couponPayment,
    ytm, 
    bondPrice, 
    faceValue, 
    numPeriods, 
    compoundFrequency, 
    customFrequency, 
    calculationType,
    useCouponPayment
  ]);

  // Reset all form fields and clear localStorage
  const handleReset = () => {
    setAnnualCouponPercentage("");
    setCouponPayment("");
    setYtm("");
    setBondPrice("");
    setFaceValue("");
    setNumPeriods("");
    setCompoundFrequency("yearly");
    setCustomFrequency("");
    setUseCouponPayment(false);
    setResult(null);
    setError(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bondCalculatorData');
    }
  };

  // Handle toggle between coupon percentage and coupon payment
  const handleCouponTypeToggle = (checked: boolean) => {
    setUseCouponPayment(checked);
    // Clear both coupon values when switching
    setAnnualCouponPercentage("");
    setCouponPayment("");
    
    // Update calculation type if necessary
    if (checked && calculationType === "annualCouponPercentage") {
      setCalculationType("couponPayment");
    } else if (!checked && calculationType === "couponPayment") {
      setCalculationType("annualCouponPercentage");
    }
  };

  // Get the effective compound frequency
  const getEffectiveFrequency = () => {
    switch (compoundFrequency) {
      case "yearly":
        return 1;
      case "semiannually":
        return 2;
      case "quarterly":
        return 4;
      case "monthly":
        return 12;
      case "custom":
        return Number(customFrequency) || 1;
      default:
        return 1;
    }
  };

  // Check if all required inputs are filled
  const areAllInputsFilled = () => {
    const isCouponValueFilled = useCouponPayment 
      ? !!couponPayment 
      : !!annualCouponPercentage;
    
    switch (calculationType) {
      case "bondPrice":
        return ytm && faceValue && numPeriods && isCouponValueFilled;
      case "ytm":
        return bondPrice && faceValue && numPeriods && isCouponValueFilled;
      case "faceValue":
        return bondPrice && ytm && numPeriods && isCouponValueFilled;
      case "annualCouponPercentage":
        return bondPrice && ytm && faceValue && numPeriods && !useCouponPayment;
      case "couponPayment":
        return bondPrice && ytm && faceValue && numPeriods && useCouponPayment;
      case "zeroCouponPrice":
        return ytm && faceValue && numPeriods;
      case "zeroCouponYTM":
        return bondPrice && faceValue && numPeriods;
      default:
        return false;
    }
  };

  // Calculate the missing value
  useEffect(() => {
    if (!areAllInputsFilled()) {
      setResult(null);
      setError(null);
      return;
    }

    try {
      // Convert inputs to numbers
      let couponRate = 0;
      let C = 0;
      
      if (useCouponPayment) {
        C = Number(couponPayment);
        // Calculate coupon rate if not calculating coupon payment
        if (calculationType !== "couponPayment" && faceValue) {
          couponRate = C / Number(faceValue);
        }
      } else {
        couponRate = Number(annualCouponPercentage) / 100; // Convert percentage to decimal
        // Calculate coupon payment if not calculating coupon percentage
        if (calculationType !== "annualCouponPercentage" && faceValue) {
          C = couponRate * Number(faceValue);
        }
      }
      
      const y = Number(ytm) / 100; // Convert YTM from percentage to decimal
      const P = Number(bondPrice);
      const F = Number(faceValue);
      const n = Number(numPeriods);
      const m = getEffectiveFrequency(); // Compound frequency

      // Validate inputs
      if (
        (calculationType !== "ytm" && isNaN(y)) ||
        (calculationType !== "bondPrice" && isNaN(P)) ||
        (calculationType !== "faceValue" && isNaN(F)) ||
        isNaN(n) ||
        (calculationType !== "ytm" && y < 0) ||
        (calculationType !== "bondPrice" && P < 0) ||
        (calculationType !== "faceValue" && F < 0) ||
        n < 0
      ) {
        setError("Please enter valid positive numbers for all fields.");
        setResult(null);
        return;
      }

      // Calculate bond price if missing
      if (calculationType === "bondPrice") {
        let price = 0;
        for (let t = 1; t <= n * m; t++) {
          price += C / m / Math.pow(1 + y / m, t);
        }
        price += F / Math.pow(1 + y / m, n * m);
        setResult(price);
        setError(null);
      }

      // Calculate YTM if missing
      else if (calculationType === "ytm") {
        // Use a numerical method (binary search) to approximate YTM
        let low = 0;
        let high = 1;
        let guess = (low + high) / 2;
        let maxIterations = 100;
        let tolerance = 0.0001;

        for (let i = 0; i < maxIterations; i++) {
          let price = 0;
          for (let t = 1; t <= n * m; t++) {
            price += C / m / Math.pow(1 + guess / m, t);
          }
          price += F / Math.pow(1 + guess / m, n * m);

          if (Math.abs(price - P) < tolerance) {
            setResult(guess * 100); // Convert YTM to percentage
            setError(null);
            return;
          }

          if (price < P) {
            high = guess;
          } else {
            low = guess;
          }
          guess = (low + high) / 2;
        }

        setError("Failed to calculate YTM. Please check your inputs.");
        setResult(null);
      }

      // Calculate face value if missing
      else if (calculationType === "faceValue") {
        // For coupon payment input, we need to solve differently
        if (useCouponPayment) {
          // Use numerical approach for face value with coupon payment
          let low = 0;
          let high = P * 10; // Assuming face value is not more than 10x the price
          let guess = (low + high) / 2;
          let maxIterations = 100;
          let tolerance = 0.01;

          for (let i = 0; i < maxIterations; i++) {
            let price = 0;
            for (let t = 1; t <= n * m; t++) {
              price += C / m / Math.pow(1 + y / m, t);
            }
            price += guess / Math.pow(1 + y / m, n * m);

            if (Math.abs(price - P) < tolerance) {
              setResult(guess);
              setError(null);
              return;
            }

            if (price > P) {
              high = guess;
            } else {
              low = guess;
            }
            guess = (low + high) / 2;
          }
          
          setError("Failed to calculate face value. Please check your inputs.");
          setResult(null);
        } else {
          // For coupon percentage, we can use the formula
          const numerator = P;
          const denominator = (1 / Math.pow(1 + y / m, n * m)) + (couponRate / m) * ((1 - 1 / Math.pow(1 + y / m, n * m)) / (y / m));
          const face = numerator / denominator;
          setResult(face);
          setError(null);
        }
      }

      // Calculate annual coupon percentage if missing
      else if (calculationType === "annualCouponPercentage") {
        const couponRate = ((P - F / Math.pow(1 + y / m, n * m)) * (y / m)) / (F * (1 - 1 / Math.pow(1 + y / m, n * m)));
        setResult(couponRate * 100); // Convert to percentage
        setError(null);
      }
      
      // Calculate coupon payment if missing
      else if (calculationType === "couponPayment") {
        const presentValueFactor = (1 - 1 / Math.pow(1 + y / m, n * m)) / (y / m);
        const C = (P - F / Math.pow(1 + y / m, n * m)) / presentValueFactor;
        setResult(C);
        setError(null);
      }

      // Calculate zero-coupon bond price
      else if (calculationType === "zeroCouponPrice") {
        const price = F / Math.pow(1 + y / m, n * m);
        setResult(price);
        setError(null);
      }

      // Calculate zero-coupon bond YTM
      else if (calculationType === "zeroCouponYTM") {
        const ytm = (Math.pow(F / P, 1 / (n * m)) - 1) * m;
        setResult(ytm * 100); // Convert to percentage
        setError(null);
      }

    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
      setResult(null);
    }
  }, [
    annualCouponPercentage, 
    couponPayment,
    ytm, 
    bondPrice, 
    faceValue, 
    numPeriods, 
    compoundFrequency, 
    customFrequency, 
    calculationType,
    useCouponPayment
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bond Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate YTM, bond price, face value, or coupon values for coupon and zero-coupon bonds.
          </p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setCalculationType("bondPrice")}
                    variant={calculationType === "bondPrice" ? "default" : "outline"}
                    className="w-full"
                  >
                    Bond Price
                  </Button>
                  <Button
                    onClick={() => setCalculationType("ytm")}
                    variant={calculationType === "ytm" ? "default" : "outline"}
                    className="w-full"
                  >
                    Yield to Maturity (YTM)
                  </Button>
                  <Button
                    onClick={() => setCalculationType("faceValue")}
                    variant={calculationType === "faceValue" ? "default" : "outline"}
                    className="w-full"
                  >
                    Par Value (Face Value)
                  </Button>
                  <Button
                    onClick={() => {
                      setCalculationType(useCouponPayment ? "couponPayment" : "annualCouponPercentage");
                    }}
                    variant={
                      (useCouponPayment && calculationType === "couponPayment") || 
                      (!useCouponPayment && calculationType === "annualCouponPercentage") 
                        ? "default" 
                        : "outline"
                    }
                    className="w-full"
                  >
                    {useCouponPayment ? "Coupon Payment" : "Annual Coupon % (r)"}
                  </Button>
                  <Button
                    onClick={() => setCalculationType("zeroCouponPrice")}
                    variant={calculationType === "zeroCouponPrice" ? "default" : "outline"}
                    className="w-full"
                  >
                    Zero Coupon Price
                  </Button>
                  <Button
                    onClick={() => setCalculationType("zeroCouponYTM")}
                    variant={calculationType === "zeroCouponYTM" ? "default" : "outline"}
                    className="w-full"
                  >
                    Zero Coupon YTM
                  </Button>
                </div>

                {/* Coupon Input Type Toggle */}
                {calculationType !== "zeroCouponPrice" && calculationType !== "zeroCouponYTM" && (
                  <div className="flex items-center space-x-2 pt-2 pb-1">
                    <Label htmlFor="coupon-type-toggle">
                      {useCouponPayment ? "Use Coupon Payment" : "Use Annual Coupon %"}
                    </Label>
                    <Switch
                      id="coupon-type-toggle"
                      checked={useCouponPayment}
                      onCheckedChange={handleCouponTypeToggle}
                    />
                  </div>
                )}

                {calculationType !== "bondPrice" && calculationType !== "zeroCouponPrice" && (
                  <InputGroup
                    id="bondPrice"
                    label="Bond Price (P)"
                    value={bondPrice}
                    onChange={setBondPrice}
                    type="text"
                    prefix="$"
                  />
                )}

                {calculationType !== "ytm" && calculationType !== "zeroCouponYTM" && (
                  <InputGroup
                    id="ytm"
                    label="Yield to Maturity (r)"
                    value={ytm}
                    onChange={setYtm}
                    type="text"
                    suffix="%"
                  />
                )}

                {calculationType !== "faceValue" && (
                  <InputGroup
                    id="faceValue"
                    label="Par Value (Fv)"
                    value={faceValue}
                    onChange={setFaceValue}
                    type="text"
                    prefix="$"
                  />
                )}

                {!useCouponPayment && calculationType !== "annualCouponPercentage" && 
                 calculationType !== "zeroCouponPrice" && calculationType !== "zeroCouponYTM" && (
                  <InputGroup
                    id="annualCouponPercentage"
                    label="Annual Coupon Percentage (c)"
                    value={annualCouponPercentage}
                    onChange={setAnnualCouponPercentage}
                    type="text"
                    suffix="%"
                  />
                )}

                {useCouponPayment && calculationType !== "couponPayment" && 
                 calculationType !== "zeroCouponPrice" && calculationType !== "zeroCouponYTM" && (
                  <InputGroup
                    id="couponPayment"
                    label="Annual Coupon Payment (PMT)"
                    value={couponPayment}
                    onChange={setCouponPayment}
                    type="text"
                    prefix="$"
                  />
                )}

                <InputGroup
                  id="numPeriods"
                  label="Number of Years (n)"
                  value={numPeriods}
                  onChange={setNumPeriods}
                  type="text"
                />

                <div>
                  <label className="text-sm font-medium">Compound Frequency (m):</label>
                  <select
                    value={compoundFrequency}
                    onChange={(e) => {
                      setCompoundFrequency(e.target.value as "yearly" | "semiannually" | "quarterly" | "monthly" | "custom");
                    }}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="yearly">Annually (1/yr)</option>
                    <option value="semiannually">Semiannually (2/yr)</option>
                    <option value="quarterly">Quarterly (4/yr)</option>
                    <option value="monthly">Monthly (12/yr)</option>
                    <option value="custom">Custom</option>
                  </select>

                  {compoundFrequency === "custom" && (
                    <InputGroup
                      id="custom-frequency"
                      label="Custom Frequency (times per year)"
                      value={customFrequency}
                      onChange={setCustomFrequency}
                      type="text"
                    />
                  )}
                </div>
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
                          ? calculationType === "ytm" || calculationType === "annualCouponPercentage" || calculationType === "zeroCouponYTM"
                            ? `${result.toFixed(2)}%`
                            : `$${result.toFixed(2)}`
                          : "—"}
                      </div>
                      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        Calculated Value
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
                <CardTitle>Notes & Formulas</CardTitle>
                <CardDescription>
                    Understanding how coupon and zero-coupon bonds work.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Formulas Section */}
                <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-semibold">The Formula</h3>
                    <p className="mb-4 font-mono">
                    Bond Price = Σ (C / (1 + YTM)^t) + F / (1 + YTM)^n
                    </p>
                    <ul className="ml-6 list-disc space-y-1 text-sm">
                    <li><strong>C</strong>: Coupon payment (annual).</li>
                    <li><strong>YTM</strong>: Yield to Maturity (annual).</li>
                    <li><strong>F</strong>: Face value of the bond.</li>
                    <li><strong>n</strong>: Number of periods (years).</li>
                    </ul>
                </div>

                {/* Key Insights Section */}
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        Bonds can be classified into coupon bonds and zero-coupon bonds. 
                        Coupon bonds pay periodic interest, whereas zero-coupon bonds do not pay interest but are sold at a discount.
                    </p>
                    <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        <li><strong>Coupon Bonds</strong>: Pay periodic interest and return face value at maturity.</li>
                        <li><strong>Zero-Coupon Bonds</strong>: Sold at a deep discount and provide a return through price appreciation.</li>
                        <li><strong>Yield to Maturity (YTM)</strong>: The total return if held to maturity.</li>
                        <li><strong>Face Value</strong>: The amount repaid to the bondholder at maturity.</li>
                        <li><strong>Bond Price</strong>: The present value of all future cash flows.</li>
                        <li><strong>Coupon Payment</strong>: The actual dollar amount paid out as interest.</li>
                        <li><strong>Coupon Rate</strong>: The annual interest rate expressed as a percentage of face value.</li>
                    </ul>
                    </div>
                </div>

                {/* Example Section */}
                <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-semibold">Example</h3>
                    <p className="mb-4 text-sm">Suppose you have the following bonds:</p>
                    
                    <h4 className="font-semibold">Coupon Bond</h4>
                    <ul className="ml-6 list-disc space-y-1 text-sm">
                    <li><strong>Annual Coupon Percentage</strong>: 5%</li>
                    <li><strong>Face Value</strong>: $1,000</li>
                    <li><strong>Annual Coupon Payment</strong>: $50 (5% of $1,000)</li>
                    <li><strong>Yield to Maturity</strong>: 5%</li>
                    <li><strong>Number of Periods</strong>: 10 years</li>
                    </ul>
                    <p className="mt-4 text-sm">
                    The bond price is calculated as:
                    </p>
                    <ul className="ml-6 list-disc space-y-1 text-sm">
                    <li>
                        <strong>Bond Price</strong>: $50 × (1 - 1 / (1 + 0.05)^10) / 0.05 + $1,000 / (1 + 0.05)^10 = $1,000
                    </li>
                    </ul>
                    
                    <h4 className="mt-4 font-semibold">Zero-Coupon Bond</h4>
                    <ul className="ml-6 list-disc space-y-1 text-sm">
                    <li><strong>Yield to Maturity</strong>: 5%</li>
                    <li><strong>Face Value</strong>: $1,000</li>
                    <li><strong>Number of Periods</strong>: 10 years</li>
                    </ul>
                    <p className="mt-4 text-sm">
                    The bond price for a zero-coupon bond is calculated as:
                    </p>
                    <ul className="ml-6 list-disc space-y-1 text-sm">
                    <li>
                        <strong>Bond Price</strong>: $1,000 / (1 + 0.05)^10 = $613.91
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