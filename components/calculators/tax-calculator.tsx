"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";

export function TaxCalculator() {
  // State for tax brackets
  const [brackets, setBrackets] = useState<
    { lower: number | ""; upper: number | ""; rate: number | "" }[]
  >([]);

  // State for income
  const [income, setIncome] = useState<string>("");

  // State for total tax
  const [totalTax, setTotalTax] = useState<number | null>(null);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedIncome = localStorage.getItem("taxCalculator_income");
    const savedBrackets = localStorage.getItem("taxCalculator_brackets");

    if (savedIncome) {
      setIncome(savedIncome);
    }

    if (savedBrackets) {
      try {
        setBrackets(JSON.parse(savedBrackets));
      } catch (e) {
        console.error("Error parsing saved brackets:", e);
        setBrackets([]);
      }
    }
  }, []);

  // Save data to localStorage whenever income or brackets change
  useEffect(() => {
    localStorage.setItem("taxCalculator_income", income);
    localStorage.setItem("taxCalculator_brackets", JSON.stringify(brackets));
  }, [income, brackets]);

  // Reset all calculator data
  const resetCalculator = () => {
    setIncome("");
    setBrackets([]);
    setTotalTax(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem("taxCalculator_income");
    localStorage.removeItem("taxCalculator_brackets");
  };

  // Add a new tax bracket
  const addBracket = () => {
    const newBracket = {
      lower: brackets.length > 0 ? Number(brackets[brackets.length - 1].upper) + 1 : 0,
      upper: "" as number | "",
      rate: "" as number | "",
    };
    setBrackets([...brackets, newBracket]);
  };

  // Remove the latest tax bracket
  const removeLatestBracket = () => {
    setBrackets(brackets.slice(0, -1));
  };

  // Update a specific bracket
  const updateBracket = (index: number, field: string, value: string) => {
    const newBrackets = [...brackets];
    newBrackets[index] = {
      ...newBrackets[index],
      [field]: value === "" ? "" : Number(value),
    };
    setBrackets(newBrackets);
  };

  // Validate inputs
  const validateInputs = () => {
    // Validate income
    if (income === "" || isNaN(Number(income))) {
      setError("Please enter a valid number for income.");
      return false;
    }

    // Validate brackets
    for (const bracket of brackets) {
      if (
        bracket.lower === "" ||
        bracket.upper === "" ||
        bracket.rate === "" ||
        isNaN(Number(bracket.lower)) ||
        isNaN(Number(bracket.upper)) ||
        isNaN(Number(bracket.rate)) ||
        Number(bracket.lower) < 0 ||
        Number(bracket.upper) < 0 ||
        Number(bracket.rate) < 0
      ) {
        setError("Please enter valid positive numbers for all bracket fields.");
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Calculate total tax
  const calculateTax = () => {
    try {
      const incomeValue = Number(income);

      // Sort brackets by lower limit
      const sortedBrackets = [...brackets].sort((a, b) => Number(a.lower) - Number(b.lower));

      // Calculate tax
      let tax = 0;
      let remainingIncome = incomeValue;

      for (const bracket of sortedBrackets) {
        if (remainingIncome <= 0) break;

        const bracketRange = Number(bracket.upper) - Number(bracket.lower);
        const taxableAmount = Math.min(remainingIncome, bracketRange);

        tax += (taxableAmount * Number(bracket.rate)) / 100;
        remainingIncome -= taxableAmount;
      }

      setTotalTax(tax);
      setError(null);
    } catch (error) {
      console.error("Calculation error:", error);
      setError("An error occurred during calculation. Please check your inputs.");
      setTotalTax(null);
    }
  };

  useEffect(() => {
    const allBracketsFilled = brackets.every(
      (bracket) =>
        bracket.lower !== "" &&
        bracket.upper !== "" &&
        bracket.rate !== "" &&
        !isNaN(Number(bracket.lower)) &&
        !isNaN(Number(bracket.upper)) &&
        !isNaN(Number(bracket.rate))
    );
  
    if (income !== "" && allBracketsFilled) {
      calculateTax();
    } else {
      setTotalTax(null);
    }
  }, [income, brackets]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate total tax owed based on a gradual tax system.
          </p>
        </div>
        <Button 
          onClick={resetCalculator}
          variant="outline"
          className="flex items-center gap-2"
          title="Reset Calculator"
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
                <div>
                  <CardTitle>Inputs</CardTitle>
                  <CardDescription>
                    Enter your income and add tax brackets.
                  </CardDescription>
                </div>
                {brackets.length > 0 && (
                  <Button
                    onClick={removeLatestBracket}
                    className="bg-red-500"
                    variant="outline"
                  >
                    Remove Latest Bracket
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <InputGroup
                  id="income"
                  label="Income"
                  value={income}
                  onChange={setIncome}
                  type="text"
                  prefix="$"
                />

                <div className="space-y-4">
                  {brackets.map((bracket, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <InputGroup
                        id={`lower-${index}`}
                        label="Lower Limit"
                        value={bracket.lower === "" ? "" : bracket.lower}
                        onChange={(value) => updateBracket(index, "lower", value)}
                        type="text"
                        prefix="$"
                        disabled={index > 0} 
                      />
                      <InputGroup
                        id={`upper-${index}`}
                        label="Upper Limit"
                        value={bracket.upper === "" ? "" : bracket.upper}
                        onChange={(value) => updateBracket(index, "upper", value)}
                        type="text"
                        prefix="$"
                      />
                      <InputGroup
                        id={`rate-${index}`}
                        label="Tax Rate"
                        value={bracket.rate === "" ? "" : bracket.rate}
                        onChange={(value) => updateBracket(index, "rate", value)}
                        type="text"
                        suffix="%"
                      />
                    </div>
                  ))}
                  <Button onClick={addBracket} className="w-full">
                    Add Bracket
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  Total tax owed based on the provided brackets and income.
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
                        {totalTax !== null
                          ? `$${totalTax.toFixed(2)}`
                          : "—"}
                      </div>
                      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        Total Tax Owed
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
                Understanding how the gradual tax system works.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulas Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">The Formula</h3>
                <p className="mb-4 font-mono">
                  Total Tax = Σ (Taxable Income in Bracket × Tax Rate)
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Taxable Income in Bracket</strong>: The portion of income that falls
                    within the bracket's range.
                  </li>
                  <li>
                    <strong>Tax Rate</strong>: The percentage of tax applied to the taxable income
                    in the bracket.
                  </li>
                </ul>
              </div>

              {/* Key Insights Section */}
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Key Insights</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    The gradual tax system applies different tax rates to different portions of
                    income. Key insights include:
                  </p>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>
                      <strong>Brackets</strong>: Income is divided into ranges (brackets), and each
                      bracket is taxed at a specific rate.
                    </li>
                    <li>
                      <strong>Marginal Tax Rate</strong>: The tax rate increases as income moves into
                      higher brackets.
                    </li>
                    <li>
                      <strong>Total Tax</strong>: The sum of taxes calculated for each bracket.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Example Section */}
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Example</h3>
                <p className="mb-4 text-sm">
                  Suppose you have the following tax brackets:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Bracket 1</strong>: $0 - $50,000 at 10%
                  </li>
                  <li>
                    <strong>Bracket 2</strong>: $50,001 - $100,000 at 20%
                  </li>
                  <li>
                    <strong>Bracket 3</strong>: $100,001 and above at 30%
                  </li>
                </ul>
                <p className="mt-4 text-sm">
                  For an income of $75,000:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Bracket 1</strong>: $50,000 × 10% = $5,000
                  </li>
                  <li>
                    <strong>Bracket 2</strong>: ($75,000 - $50,000) × 20% = $5,000
                  </li>
                  <li>
                    <strong>Total Tax</strong>: $5,000 + $5,000 = $10,000
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