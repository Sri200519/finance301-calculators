"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

export function PerpetuityCalculator() {
  const [payment, setPayment] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [growthRate, setGrowthRate] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [perpetuityType, setPerpetuityType] = useState<"normal" | "growth">("normal");
  const [error, setError] = useState<string | null>(null);

  // Validate inputs
  const validateInputs = () => {
    const isPaymentValid = !isNaN(Number(payment)) && Number(payment) > 0;
    const isRateValid = !isNaN(Number(rate)) && Number(rate) > 0;
    const isGrowthRateValid = perpetuityType === "growth" ? !isNaN(Number(growthRate)) && Number(growthRate) >= 0 : true;

    if (!isPaymentValid) {
      setError("Please enter a valid positive number for Payment Amount.");
      return false;
    }
    if (!isRateValid) {
      setError("Please enter a valid positive number for Discount Rate.");
      return false;
    }
    if (!isGrowthRateValid) {
      setError("Please enter a valid non-negative number for Growth Rate.");
      return false;
    }

    setError(null);
    return true;
  };

  useEffect(() => {
    if (
      (perpetuityType === "normal" && payment !== "" && rate !== "") ||
      (perpetuityType === "growth" && payment !== "" && rate !== "" && growthRate !== "")
    ) {
      if (validateInputs()) {
        calculatePerpetuity();
      }
    } else {
      // Clear result and error if inputs are incomplete
      setResult(null);
      setError(null);
    }
  }, [payment, rate, growthRate, perpetuityType]);

  const calculatePerpetuity = () => {
    try {
      const P = Number(payment);
      const r = Number(rate) / 100;
      const g = Number(growthRate) / 100;

      if (perpetuityType === "normal") {
        // Normal Perpetuity: PV = P / r
        const presentValue = P / r;
        setResult(presentValue);
      } else if (perpetuityType === "growth") {
        // Constant Growth Perpetuity: PV = P / (r - g)
        if (r <= g) {
          setError("Discount rate must be greater than the growth rate.");
          setResult(null);
          return;
        }
        const presentValue = P / (r - g);
        setResult(presentValue);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
      setResult(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perpetuity Calculator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Calculate the present value of normal perpetuities or constant growth perpetuities.
        </p>
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
                <CardDescription>Enter your values and select the perpetuity type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Perpetuity Type:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={perpetuityType === "normal" ? "default" : "outline"}
                      onClick={() => setPerpetuityType("normal")}
                      className="w-full"
                    >
                      Normal Perpetuity
                    </Button>
                    <Button
                      variant={perpetuityType === "growth" ? "default" : "outline"}
                      onClick={() => setPerpetuityType("growth")}
                      className="w-full"
                    >
                      Growth Perpetuity
                    </Button>
                  </div>
                </div>

                <InputGroup
                  id="payment"
                  label="Payment Amount (A)"
                  value={payment}
                  onChange={setPayment}
                  type="text"
                  prefix="$"
                  disabled={false}
                />

                <InputGroup
                  id="rate"
                  label="Discount Rate (r)"
                  value={rate}
                  onChange={setRate}
                  type="text"
                  suffix="%"
                  disabled={false}
                />

                {perpetuityType === "growth" && (
                  <InputGroup
                    id="growthRate"
                    label="Growth Rate (g)"
                    value={growthRate}
                    onChange={setGrowthRate}
                    type="text"
                    suffix="%"
                    disabled={false}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {perpetuityType === "normal"
                    ? "The present value of the normal perpetuity"
                    : "The present value of the constant growth perpetuity"}
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
                        {perpetuityType === "normal"
                          ? "Present value of normal perpetuity"
                          : "Present value of constant growth perpetuity"}
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
              <CardTitle>Perpetuity Formulas & Notes</CardTitle>
              <CardDescription>Understanding how perpetuities work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulas Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">The Formulas</h3>
                <p className="mb-4 font-mono">
                  Normal Perpetuity: PV = P / r
                </p>
                <p className="mb-4 font-mono">
                  Constant Growth Perpetuity: PV = P / (r - g)
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>PV = Present Value</li>
                  <li>P = Payment Amount</li>
                  <li>r = Discount Rate (decimal)</li>
                  <li>g = Growth Rate (decimal)</li>
                </ul>
              </div>

              {/* Key Insights Section */}
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    Perpetuities are financial instruments that provide infinite payments over time. Key insights include:
                  </p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>
                      <strong>Normal Perpetuity</strong>: Payments are fixed and continue indefinitely.
                    </li>
                    <li>
                      <strong>Constant Growth Perpetuity</strong>: Payments grow at a constant rate indefinitely.
                    </li>
                    <li>
                      <strong>Discount Rate</strong>: Represents the required rate of return or interest rate.
                    </li>
                    <li>
                      <strong>Growth Rate</strong>: Must be less than the discount rate for the formula to be valid.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Common Applications Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Common Applications</h3>
                <p className="mb-4 text-sm">
                  Perpetuities are used in various financial scenarios:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Valuing Stocks</strong>: Dividend-paying stocks can be valued using the constant growth perpetuity model.
                  </li>
                  <li>
                    <strong>Real Estate</strong>: Rental income from properties can be modeled as a perpetuity.
                  </li>
                  <li>
                    <strong>Endowments</strong>: Charitable endowments often use perpetuities to provide ongoing funding.
                  </li>
                  <li>
                    <strong>Pensions</strong>: Some pension plans are structured as perpetuities to provide lifelong income.
                  </li>
                </ul>
              </div>

              {/* Example Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Example</h3>
                <p className="mb-4 text-sm">
                  Suppose you receive $1,000 annually with a discount rate of 5%:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Normal Perpetuity</strong>:  
                    PV = $1,000 / 0.05 = $20,000
                  </li>
                  <li>
                    <strong>Constant Growth Perpetuity (2% growth)</strong>:  
                    PV = $1,000 / (0.05 - 0.02) = $33,333.33
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