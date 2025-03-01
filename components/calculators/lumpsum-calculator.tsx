import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [compoundFrequency, setCompoundFrequency] = useState<string>("yearly");
  const [customFrequency, setCustomFrequency] = useState<string>("");
  const [futureValue, setFutureValue] = useState<string>("");
  const [solveFor, setSolveFor] = useState<"FV" | "PV" | "r" | "n">("FV");
  const [result, setResult] = useState<number | null>(null);
  const [compoundInterest, setCompoundInterest] = useState<number | null>(null);
  const [ear, setEar] = useState<number | null>(null);

  const calculateCompoundInterest = () => {
    try {
      let PV = parseFloat(principal);
      let r = parseFloat(rate) / 100;
      let t = parseFloat(time);
      let FV = parseFloat(futureValue);
      let m: number;
  
      switch (compoundFrequency) {
        case "yearly":
          m = 1;
          break;
        case "semiannually":
          m = 2;
          break;
        case "quarterly":
          m = 4;
          break;
        case "monthly":
          m = 12;
          break;
        case "custom":
          m = parseInt(customFrequency);
          break;
        case "continuous":
          m = 0; 
          break;
        default:
          m = 12;
      }
  
      if (
        (solveFor === "FV" && (isNaN(PV) || PV <= 0 || isNaN(r) || r <= 0 || isNaN(t) || t <= 0)) ||
        (solveFor === "PV" && (isNaN(FV) || FV <= 0 || isNaN(r) || r <= 0 || isNaN(t) || t <= 0)) ||
        (solveFor === "r" && (isNaN(PV) || PV <= 0 || isNaN(FV) || FV <= 0 || isNaN(t) || t <= 0)) ||
        (solveFor === "n" && (isNaN(PV) || PV <= 0 || isNaN(FV) || FV <= 0 || isNaN(r) || r <= 0)) ||
        (m <= 0 && m !== 0) 
      ) {
        console.error("Invalid inputs.");
        return;
      }
  
      let calculatedResult: number;
      let totalCompoundInterest: number | null = null;
  
      if (solveFor === "FV") {
        if (m === 0) {
          calculatedResult = PV * Math.exp(r * t);
        } else {
          calculatedResult = PV * Math.pow(1 + r / m, m * t);
        }
        totalCompoundInterest = calculatedResult - PV; 
        setCompoundInterest(totalCompoundInterest); 
  
        if (m !== 0 && m !== 1) {
          setEar(Math.pow(1 + r / m, m) - 1); 
        } else {
          setEar(null);
        }
      } else if (solveFor === "PV") {
        if (m === 0) {
          calculatedResult = FV / Math.exp(r * t);
        } else {
          calculatedResult = FV / Math.pow(1 + r / m, m * t);
        }
      } else if (solveFor === "r") {
        if (m === 0) {
          calculatedResult = Math.log(FV / PV) / t * 100;
        } else {
          calculatedResult = m * (Math.pow(FV / PV, 1 / (m * t)) - 1) * 100; 
        }
      } else if (solveFor === "n") {
        if (m === 0) {
          calculatedResult = Math.log(FV / PV) / r;
        } else {
          calculatedResult = Math.log(FV / PV) / (m * Math.log(1 + r / m));
        }
      } else {
        throw new Error("Invalid solve for option");
      }
  
      setResult(calculatedResult);
  
      if (solveFor === "FV") {
        setFutureValue(calculatedResult.toFixed(2));
      }
  
    } catch (error) {
      console.error("Calculation error:", error);
    }
  };
  
  

  useEffect(() => {
    const canCalculate = 
      (solveFor === "FV" && principal !== "" && rate !== "" && time !== "") ||
      (solveFor === "PV" && futureValue !== "" && rate !== "" && time !== "") ||
      (solveFor === "r" && principal !== "" && futureValue !== "" && time !== "") ||
      (solveFor === "n" && principal !== "" && futureValue !== "" && rate !== "");
    
    if (canCalculate && compoundFrequency !== "") {
      calculateCompoundInterest();
    }
  }, [principal, rate, time, futureValue, compoundFrequency, customFrequency, solveFor]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Value of Lump Sums Calculator</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Calculate how your lump sums grow over time with compound interest.
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
                <CardDescription>Enter your values and select what to solve for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solve for:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={solveFor === "FV" ? "default" : "outline"}
                      onClick={() => setSolveFor("FV")}
                      className="w-full"
                    >
                      Future Value (FV)
                    </Button>
                    <Button
                      variant={solveFor === "PV" ? "default" : "outline"}
                      onClick={() => setSolveFor("PV")}
                      className="w-full"
                    >
                      Present Value (PV)
                    </Button>
                    <Button
                      variant={solveFor === "r" ? "default" : "outline"}
                      onClick={() => setSolveFor("r")}
                      className="w-full"
                    >
                      Interest Rate (r)
                    </Button>
                    <Button
                      variant={solveFor === "n" ? "default" : "outline"}
                      onClick={() => setSolveFor("n")}
                      className="w-full"
                    >
                      Time Period (n)
                    </Button>
                  </div>
                </div>

                {/* Present Value Input - Hide when solving for PV */}
                {solveFor !== "PV" && (
                  <InputGroup
                    id="principal"
                    label="Present Value (PV)"
                    value={principal}
                    onChange={setPrincipal}
                    type="text"
                    prefix="$"
                    disabled={false}
                  />
                )}

                {/* Future Value Input - Show when NOT solving for FV */}
                {solveFor !== "FV" && (
                  <InputGroup
                    id="future-value"
                    label="Future Value (FV)"
                    value={futureValue}
                    onChange={setFutureValue}
                    type="text"
                    prefix="$"
                    disabled={false}
                  />
                )}

                {/* Interest Rate Input - Hide when solving for r */}
                {solveFor !== "r" && (
                  <InputGroup
                    id="rate"
                    label="Annual Interest Rate (r)"
                    value={rate}
                    onChange={setRate}
                    type="text"
                    suffix="%"
                    disabled={false}
                  />
                )}

                {/* Time Period Input - Hide when solving for n */}
                {solveFor !== "n" && (
                  <InputGroup
                    id="time"
                    label="Time Period (n)"
                    value={time}
                    onChange={setTime}
                    type="text"
                    suffix="years"
                    disabled={false}
                  />
                )}

                <div>
                  <label className="text-sm font-medium">Compound Frequency (m):</label>
                  <select
                    value={compoundFrequency}
                    onChange={(e) => {
                      setCompoundFrequency(e.target.value);
                    }}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="yearly">Annually (1/yr)</option>
                    <option value="semiannually">Semiannually (2/yr)</option>
                    <option value="quarterly">Quarterly (4/yr)</option>
                    <option value="monthly">Monthly (12/yr)</option>
                    <option value="custom">Custom</option>
                    <option value="continuous">Continuous</option>
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
                  {solveFor === "FV"
                    ? "The future value after compound interest"
                    : solveFor === "PV"
                    ? "The present value (initial amount)"
                    : solveFor === "r"
                    ? "The required interest rate"
                    : "The time period (n) required"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-full flex-col items-center justify-center py-6">
                  <div className="text-4xl font-bold text-primary">
                    {result !== null
                      ? solveFor === "r"
                        ? `${result.toFixed(2)}%`
                        : solveFor === "n"
                        ? `${result.toFixed(2)} years`
                        : `$${result.toFixed(2)}`
                      : "—"}
                  </div>

                  

                  <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {solveFor === "FV"
                      ? "Future value after interest"
                      : solveFor === "PV"
                      ? "Present value needed"
                      : solveFor === "r"
                      ? "Annual interest rate"
                      : "Time period required"}
                  </p>

                  {compoundInterest !== null && solveFor === "FV" && (
                    <div className="mt-4 text-lg text-gray-600">
                      Total Compound Interest: ${compoundInterest.toFixed(2)}
                    </div>
                  )}

                  {ear !== null && solveFor === "FV" && (
                    <div className="mt-4 text-lg text-gray-600">
                      Effective Annual Rate (EAR): {((ear * 100).toFixed(2))}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Compound Interest Formula</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Compound interest is calculated using the following formula:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 dark:bg-gray-900 dark:text-white">
                A = P * (1 + r / n)^(nt)
              </pre>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Where:
              </p>
              <ul className="list-inside list-disc text-lg text-gray-500 dark:text-gray-400">
                <li><strong>A</strong> = Future Value (FV), the amount of money accumulated after interest</li>
                <li><strong>P</strong> = Principal (PV), the initial amount of money</li>
                <li><strong>r</strong> = Interest Rate (annual), expressed as a decimal</li>
                <li><strong>n</strong> = Number of times the interest is compounded per year</li>
                <li><strong>t</strong> = Time (in years)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Effective Annual Rate (EAR)</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                The Effective Annual Rate (EAR) is a way to express the annual interest rate accounting for the effects of compound interest. It provides a more accurate reflection of the real return on investment when interest is compounded more frequently than annually.
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                The formula for EAR is:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 dark:bg-gray-900 dark:text-white">
                EAR = (1 + r / n) ^ n - 1
              </pre>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Where:
              </p>
              <ul className="list-inside list-disc text-lg text-gray-500 dark:text-gray-400">
                <li><strong>EAR</strong> = Effective Annual Rate</li>
                <li><strong>r</strong> = Nominal interest rate (annual rate expressed as a decimal)</li>
                <li><strong>n</strong> = Number of times the interest is compounded per year</li>
              </ul>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                The EAR helps to compare different investment options that use different compounding frequencies (e.g., annually, quarterly, monthly). A higher compounding frequency will result in a higher EAR.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Key Concepts</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Understanding how compound interest works is crucial for investments, loans, and savings. Below are some key concepts:
              </p>
              <ul className="list-inside list-disc text-lg text-gray-500 dark:text-gray-400">
                <li><strong>Compound Frequency:</strong> The frequency at which interest is applied to the principal. It can be annual, semiannual, quarterly, monthly, or even continuous. A higher frequency leads to more frequent compounding and potentially higher interest.</li>
                <li><strong>Continuous Compounding:</strong> In continuous compounding, the interest is applied constantly. The formula for continuous compounding is:
                  <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 dark:bg-gray-900 dark:text-white">
                    A = P * e^(rt)
                  </pre>
                  Where <strong>e</strong> is Euler's number (~2.718).
                </li>
                <li><strong>Time Period (t):</strong> The number of years over which the interest is calculated. The longer the time period, the greater the impact of compound interest on the growth of an investment.</li>
                <li><strong>Rate of Interest (r):</strong> The annual rate at which the investment grows, expressed as a decimal. For example, a 5% interest rate is written as 0.05.</li>
                <li><strong>Present Value (PV):</strong> The initial amount of money or the principal invested or loaned.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Examples</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Let’s go through a couple of examples to see how compound interest works:
              </p>

              <h3 className="text-xl font-semibold">Example 1: Annual Compounding</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                You invest $1,000 at an annual interest rate of 5% for 10 years. The interest is compounded annually. Using the formula:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 dark:bg-gray-900 dark:text-white">
                A = 1000 * (1 + 0.05 / 1)^(1 * 10)
              </pre>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                After 10 years, your investment will grow to $1,628.89. The compound interest earned is $628.89.
              </p>

              <h3 className="text-xl font-semibold">Example 2: Monthly Compounding</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                You invest $1,000 at an annual interest rate of 5% for 10 years, but this time, the interest is compounded monthly. Using the formula:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 dark:bg-gray-900 dark:text-white">
                A = 1000 * (1 + 0.05 / 12)^(12 * 10)
              </pre>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                After 10 years, your investment will grow to $1,647.01. The compound interest earned is $647.01, which is higher than the annual compounding example.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Tips for Using the Calculator</h2>
              <ul className="list-inside list-disc text-lg text-gray-500 dark:text-gray-400">
                <li>Always double-check the units for the time period and rate. Make sure the rate is in decimal form (e.g., 5% as 0.05).</li>
                <li>If solving for the future value, ensure you’ve entered the principal amount, interest rate, and time period correctly.</li>
                <li>If you’re unsure about the frequency of compounding, choose a standard option like yearly or monthly to start with.</li>
                <li>Be aware that higher compounding frequencies (e.g., daily or continuously) lead to slightly higher results due to more frequent application of interest.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Conclusion</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Compound interest is a powerful concept that helps your money grow exponentially over time. The more frequently interest is compounded, the more your investment will benefit. Understanding how different factors (interest rate, compounding frequency, and time) influence compound interest will allow you to make more informed financial decisions.
              </p>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
