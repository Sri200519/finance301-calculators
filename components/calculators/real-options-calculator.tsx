"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw, Plus, Minus } from "lucide-react";

export function RealOptionsCalculator() {
  const [probability, setProbability] = useState("50");
  const [franchiseValue, setFranchiseValue] = useState("");
  const [noFranchiseValue, setNoFranchiseValue] = useState("");
  const [costs, setCosts] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState("calculator");
  const [isInitialized, setIsInitialized] = useState(false);

  const [result, setResult] = useState<number | null>(null);
  const [breakevenProbability, setBreakevenProbability] = useState<number | null>(null);
  const [tree, setTree] = useState<string[][]>([]);

  const LOCAL_STORAGE_KEY = "realOptionsCalculatorState";

  // Validation function
  const areInputsValid = () => {
    // Check probability
    const p = Number(probability);
    if (isNaN(p) || p < 0 || p > 100) return false;
    
    // Check franchise value
    const vSuccess = Number(franchiseValue);
    if (isNaN(vSuccess)) return false;
    
    // Check no franchise value
    const vFailure = Number(noFranchiseValue);
    if (isNaN(vFailure)) return false;
    
    // Check costs
    for (const cost of costs) {
      const costValue = Number(cost);
      if (isNaN(costValue)) return false;
    }
    
    return true;
  };

  const calculateRealOptionNPV = () => {
    if (!areInputsValid()) {
      setResult(null);
      setTree([]);
      return;
    }

    const p = Number(probability) / 100;
    const vSuccess = Number(franchiseValue);
    const totalCost = costs.reduce((sum, c) => sum + Number(c || 0), 0);
    const abandonCost = Number(costs[0] || 0);

    const continueNPV = vSuccess - totalCost;
    const abandonNPV = -abandonCost;

    const npv = p * continueNPV + (1 - p) * abandonNPV;
    setResult(npv);

    setTree([
      ["Start → Accept"],
      [" ├─ Franchise Awarded → Finish → NPV = $" + continueNPV.toFixed(2)],
      [" └─ Franchise Denied → Abandon → NPV = $" + abandonNPV.toFixed(2)],
      ["Start → Reject → NPV = $0"]
    ]);
  };

  const calculateBreakevenProbability = () => {
    if (!areInputsValid()) {
      setBreakevenProbability(null);
      return;
    }

    const vSuccess = Number(franchiseValue);
    const totalCost = costs.reduce((sum, c) => sum + Number(c || 0), 0);
    const abandonCost = Number(costs[0] || 0);

    const continueNPV = vSuccess - totalCost;
    const abandonNPV = -abandonCost;

    // Check for division by zero
    if (continueNPV === abandonNPV) {
      setBreakevenProbability(0.5);
      return;
    }

    const p = -abandonNPV / (continueNPV - abandonNPV);
    // Ensure p is between 0 and 1
    setBreakevenProbability(Math.max(0, Math.min(1, p)));
  };

  const handleReset = () => {
    setProbability("50");
    setFranchiseValue("");
    setNoFranchiseValue("");
    setCosts([""]);
    setResult(null);
    setBreakevenProbability(null);
    setTree([]);
    
    // Make sure to update localStorage with reset values
    const resetState = {
      probability: "50",
      franchiseValue: "",
      noFranchiseValue: "",
      costs: [""],
      activeTab
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetState));
  };

  // Handle tab change with explicit state saving
  const handleTabChange = (value: SetStateAction<string>) => {
    setActiveTab(value);
    
    // Save current state with new tab value
    const stateToSave = {
      probability,
      franchiseValue,
      noFranchiseValue,
      costs,
      activeTab: value
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  };

  // Load saved state on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProbability(parsed.probability || "50");
        setFranchiseValue(parsed.franchiseValue || "");
        setNoFranchiseValue(parsed.noFranchiseValue || "");
        setCosts(parsed.costs || [""]);
        setActiveTab(parsed.activeTab || "calculator");
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
      // If there's an error, reset to defaults
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    setIsInitialized(true);
  }, []);

  // Save state and recalculate when inputs change
  useEffect(() => {
    if (!isInitialized) return;
    
    const stateToSave = {
      probability,
      franchiseValue,
      noFranchiseValue,
      costs,
      activeTab
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    
    // Only calculate if inputs are valid
    calculateRealOptionNPV();
    calculateBreakevenProbability();
  }, [probability, franchiseValue, noFranchiseValue, costs, isInitialized]);

  const updateCost = (index: number, value: string) => {
    const updated = [...costs];
    updated[index] = value;
    setCosts(updated);
    
    // Immediately save to localStorage with updated costs
    if (isInitialized) {
      const stateToSave = {
        probability,
        franchiseValue,
        noFranchiseValue,
        costs: updated,
        activeTab
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  };

  const addYear = () => {
    const updated = [...costs, ""];
    setCosts(updated);
    
    // Immediately save to localStorage with updated costs
    if (isInitialized) {
      const stateToSave = {
        probability,
        franchiseValue,
        noFranchiseValue,
        costs: updated,
        activeTab
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  };
  
  const removeYear = () => {
    if (costs.length <= 1) return;
    
    const updated = costs.slice(0, -1);
    setCosts(updated);
    
    // Immediately save to localStorage with updated costs
    if (isInitialized) {
      const stateToSave = {
        probability,
        franchiseValue,
        noFranchiseValue,
        costs: updated,
        activeTab
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real Options Calculator</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Analyze projects with flexibility to abandon based on new information.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="formulas">Formulas & Logic</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Enter project details and probabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputGroup
                  id="probability"
                  label="Probability of Franchise Awarded (%)"
                  value={probability}
                  onChange={setProbability}
                  type="text"
                  suffix="%"
                />
                <InputGroup
                  id="franchiseValue"
                  label="Value if Franchise is Awarded"
                  value={franchiseValue}
                  onChange={setFranchiseValue}
                  type="text"
                  prefix="$"
                />
                <InputGroup
                  id="noFranchiseValue"
                  label="Value if Franchise is Not Awarded"
                  value={noFranchiseValue}
                  onChange={setNoFranchiseValue}
                  type="text"
                  prefix="$"
                />
                {costs.map((cost, index) => (
                  <InputGroup
                    key={index}
                    id={`year${index + 1}Cost`}
                    label={`Year ${index + 1} Cost`}
                    value={cost}
                    onChange={(val) => updateCost(index, val)}
                    type="text"
                    prefix="$"
                  />
                ))}
                <div className="flex gap-2 pt-2">
                  <Button onClick={addYear} variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Year
                  </Button>
                  <Button onClick={removeYear} variant="outline" size="sm" className="flex items-center gap-1">
                    <Minus className="h-4 w-4" /> Remove Year
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Option-based decision evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!areInputsValid() ? (
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-300">Invalid Input</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Please ensure all inputs are valid numbers. Probability must be between 0 and 100%.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {result !== null && (
                      <div className="text-lg">
                        <strong>Real Option NPV:</strong> ${result.toFixed(2)}
                      </div>
                    )}
                    {breakevenProbability !== null && (
                      <div className="text-lg">
                        <strong>Breakeven Probability:</strong> {(breakevenProbability * 100).toFixed(2)}%
                      </div>
                    )}
                    {tree.length > 0 && (
                      <div className="pt-4 font-mono text-sm whitespace-pre">
                        {tree.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formulas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Real Option Formulas</CardTitle>
              <CardDescription>Quick reference for calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono">NPV = P × (Value - Total Cost) + (1 - P) × (- Year 1 Cost)</p>
              <p className="font-mono">Breakeven P = -Abandon_NPV / (Continue_NPV - Abandon_NPV)</p>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Decision Tip</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Real options add value by incorporating flexibility. If P &gt; breakeven, continue. Otherwise, abandon.
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