"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// Import RotateCcw icon instead of Trash2
import { RotateCcw } from "lucide-react";

// Define the shape of the state to be saved
interface SavedState {
  mainTab: "calculator" | "notes";
  activeCalc: "percentage-fall" | "wacc" | "cost-of-debt" | "cost-of-equity" | "eps" | "eps-partition" | "annual-shield" | "value-shield" | "ebit-be";
  factor: string;
  E: string; D: string; Re: string; Rd: string; Tc: string;
  intExpense: string; debtAmt: string; taxD: string;
  rf: string; beta: string; rm: string;
  shares: string; interest: string; taxRate: string; ebitLe: string;
  partitionEBIT: string; partitionDebt: string; partitionRate: string; partitionShares: string; partitionTaxRate: string;
  shieldDebt: string; shieldInterestRate: string; shieldTaxRate: string;
  debtShield2: string; taxShield2: string;
  debtBE: string; intRateBE: string; sharesBE1: string; sharesBE2: string;
}

const LOCAL_STORAGE_KEY = "waccCalculatorState";

export function WaccCalculator() {
  // Main tab: "calculator" or "notes"
  const [mainTab, setMainTab] = useState<"calculator" | "notes">("calculator");

  // Define metrics and extract key union
  const metrics = [
    { key: "percentage-fall", label: "% Fall" },
    { key: "wacc",            label: "WACC" },
    { key: "cost-of-debt",    label: "Cost of Debt" },
    { key: "cost-of-equity",  label: "Cost of Equity" },
    { key: "eps",             label: "EPS (Dynamic)" },
    { key: "eps-partition",   label: "EPS Partition" },
    { key: "annual-shield",   label: "Annual Shield" },
    { key: "value-shield",    label: "Value Shield" },
    { key: "ebit-be",         label: "EBIT BE" },
  ] as const;

  type CalcKey = typeof metrics[number]["key"];
  const [activeCalc, setActiveCalc] = useState<CalcKey>(metrics[0].key);

  const Dash = () => <p className="text-4xl font-bold">—</p>;

  // 1. Percentage Fall
  const [factor, setFactor] = useState("");
  const [fallResult, setFallResult] = useState<number | null>(null);
  useEffect(() => {
    const f = parseFloat(factor);
    setFallResult(!isNaN(f) && f > 0 ? (1 / f) * 100 : null);
  }, [factor]);

  // 2. WACC
  const [E, setE] = useState(""),
        [D, setD] = useState(""),
        [Re, setRe] = useState(""),
        [Rd, setRd] = useState(""),
        [Tc, setTc] = useState("");
  const [waccResult, setWaccResult] = useState<number | null>(null);
  useEffect(() => {
    const e = parseFloat(E), d = parseFloat(D),
          re = parseFloat(Re) / 100, rd = parseFloat(Rd) / 100,
          tc = parseFloat(Tc) / 100;
    if (![e,d,re,rd,tc].some(isNaN) && e + d > 0) {
      setWaccResult(((e/(e+d))*re + (d/(e+d))*rd*(1-tc))*100);
    } else setWaccResult(null);
  }, [E,D,Re,Rd,Tc]);

  // 3. Cost of Debt
  const [intExpense, setIntExpense] = useState(""),
        [debtAmt, setDebtAmt]       = useState(""),
        [taxD, setTaxD]             = useState("");
  const [codResult, setCodResult] = useState<{ pre:number; after:number }|null>(null);
  useEffect(() => {
    const i = parseFloat(intExpense), debt = parseFloat(debtAmt),
          tc = parseFloat(taxD)/100;
    if (![i,debt,tc].some(isNaN) && debt>0) {
      const pre = (i/debt)*100;
      setCodResult({ pre, after: pre*(1-tc) });
    } else setCodResult(null);
  }, [intExpense,debtAmt,taxD]);

  // 4. Cost of Equity (CAPM)
  const [rf, setRf] = useState(""),
        [beta, setBeta] = useState(""),
        [rm, setRm] = useState("");
  const [coeResult, setCoeResult] = useState<number|null>(null);
  useEffect(() => {
    const rFree = parseFloat(rf)/100, b = parseFloat(beta), m = parseFloat(rm)/100;
    if (![rFree,b,m].some(isNaN)) {
      setCoeResult((rFree + b*(m - rFree))*100);
    } else setCoeResult(null);
  }, [rf,beta,rm]);

  // 5. EPS (Dynamic)
  const [shares, setShares] = useState(""),
        [interest, setInterest] = useState(""),
        [taxRate, setTaxRate] = useState(""),
        [ebitLe, setEbitLe] = useState("");
  const [leveredEPS, setLeveredEPS] = useState<number|null>(null);
  useEffect(() => {
    const S = parseFloat(shares),
          I = parseFloat(interest),
          T = parseFloat(taxRate)/100,
          E = parseFloat(ebitLe);
    if (![S,I,T,E].some(isNaN) && S>0) {
      setLeveredEPS(((E - I)*(1 - T))/S);
    } else setLeveredEPS(null);
  }, [shares,interest,taxRate,ebitLe]);

  // 6. EPS Partition
  const [partitionEBIT, setPartitionEBIT]       = useState(""),
        [partitionDebt, setPartitionDebt]       = useState(""),
        [partitionRate, setPartitionRate]       = useState(""),
        [partitionShares, setPartitionShares]   = useState(""),
        [partitionTaxRate, setPartitionTaxRate] = useState("");
  const [epsPartition, setEpsPartition] = useState<number|null>(null);
  useEffect(() => {
    const EBITp = parseFloat(partitionEBIT),
          Dp    = parseFloat(partitionDebt),
          rp    = parseFloat(partitionRate)/100,
          Sp    = parseFloat(partitionShares),
          Tp    = parseFloat(partitionTaxRate)/100;
    if (![EBITp,Dp,rp,Sp,Tp].some(isNaN) && Sp>0) {
      const Ip = Dp * rp;
      setEpsPartition(((EBITp - Ip)*(1 - Tp))/Sp);
    } else setEpsPartition(null);
  }, [partitionEBIT,partitionDebt,partitionRate,partitionShares,partitionTaxRate]);

  // 7. Annual Shield + PV
  const [shieldDebt, setShieldDebt]           = useState(""),
        [shieldInterestRate, setShieldInterestRate] = useState(""),
        [shieldTaxRate, setShieldTaxRate]     = useState("");
  const [annualShield, setAnnualShield] = useState<number|null>(null);
  const [pvShield, setPvShield]         = useState<number|null>(null);
  useEffect(() => {
    const D = parseFloat(shieldDebt),
          r = parseFloat(shieldInterestRate)/100,
          t = parseFloat(shieldTaxRate)/100;
    if (![D,r,t].some(isNaN) && D>0) {
      const annual = D * r * t;
      setAnnualShield(annual);
      setPvShield(r>0 ? annual / r: null);
    } else {
      setAnnualShield(null);
      setPvShield(null);
    }
  }, [shieldDebt,shieldInterestRate,shieldTaxRate]);

  // 8. Value of Tax Shield (legacy)
  const [debtShield2, setDebtShield2] = useState(""),
        [taxShield2, setTaxShield2]   = useState("");
  const [valShieldResult, setValShieldResult] = useState<number|null>(null);
  useEffect(() => {
    const debt = parseFloat(debtShield2),
          tc2  = parseFloat(taxShield2)/100;
    setValShieldResult(!isNaN(debt)&&!isNaN(tc2) ? debt*tc2 : null);
  }, [debtShield2,taxShield2]);

  // 9. EBIT Breakeven
  const [debtBE, setDebtBE]       = useState(""),
        [intRateBE, setIntRateBE] = useState(""),
        [sharesBE1, setSharesBE1] = useState(""),
        [sharesBE2, setSharesBE2] = useState("");
  const [ebitBE, setEbitBE] = useState<number|null>(null);
  useEffect(() => {
    const d  = parseFloat(debtBE),
          r  = parseFloat(intRateBE)/100,
          s1 = parseFloat(sharesBE1),
          s2 = parseFloat(sharesBE2);
    setEbitBE(!isNaN(d)&&!isNaN(r)&&s1>s2 ? (s1*d*r)/(s1-s2) : null);
  }, [debtBE,intRateBE,sharesBE1,sharesBE2]);

  // --- LocalStorage Load Effect ---
  useEffect(() => {
    const savedStateRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateRaw) {
      try {
        const savedState: SavedState = JSON.parse(savedStateRaw);
        setMainTab(savedState.mainTab ?? "calculator");
        setActiveCalc(savedState.activeCalc ?? metrics[0].key);
        setFactor(savedState.factor ?? "");
        setE(savedState.E ?? ""); setD(savedState.D ?? ""); setRe(savedState.Re ?? ""); setRd(savedState.Rd ?? ""); setTc(savedState.Tc ?? "");
        setIntExpense(savedState.intExpense ?? ""); setDebtAmt(savedState.debtAmt ?? ""); setTaxD(savedState.taxD ?? "");
        setRf(savedState.rf ?? ""); setBeta(savedState.beta ?? ""); setRm(savedState.rm ?? "");
        setShares(savedState.shares ?? ""); setInterest(savedState.interest ?? ""); setTaxRate(savedState.taxRate ?? ""); setEbitLe(savedState.ebitLe ?? "");
        setPartitionEBIT(savedState.partitionEBIT ?? ""); setPartitionDebt(savedState.partitionDebt ?? ""); setPartitionRate(savedState.partitionRate ?? ""); setPartitionShares(savedState.partitionShares ?? ""); setPartitionTaxRate(savedState.partitionTaxRate ?? "");
        setShieldDebt(savedState.shieldDebt ?? ""); setShieldInterestRate(savedState.shieldInterestRate ?? ""); setShieldTaxRate(savedState.shieldTaxRate ?? "");
        setDebtShield2(savedState.debtShield2 ?? ""); setTaxShield2(savedState.taxShield2 ?? "");
        setDebtBE(savedState.debtBE ?? ""); setIntRateBE(savedState.intRateBE ?? ""); setSharesBE1(savedState.sharesBE1 ?? ""); setSharesBE2(savedState.sharesBE2 ?? "");
      } catch (error) {
        console.error("Failed to parse saved state:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- LocalStorage Save Effect ---
  useEffect(() => {
    const stateToSave: SavedState = {
      mainTab, activeCalc, factor,
      E, D, Re, Rd, Tc,
      intExpense, debtAmt, taxD,
      rf, beta, rm,
      shares, interest, taxRate, ebitLe,
      partitionEBIT, partitionDebt, partitionRate, partitionShares, partitionTaxRate,
      shieldDebt, shieldInterestRate, shieldTaxRate,
      debtShield2, taxShield2,
      debtBE, intRateBE, sharesBE1, sharesBE2,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [ // Add all state variables that should trigger a save
    mainTab, activeCalc, factor, E, D, Re, Rd, Tc, intExpense, debtAmt, taxD,
    rf, beta, rm, shares, interest, taxRate, ebitLe, partitionEBIT, partitionDebt,
    partitionRate, partitionShares, partitionTaxRate, shieldDebt, shieldInterestRate,
    shieldTaxRate, debtShield2, taxShield2, debtBE, intRateBE, sharesBE1, sharesBE2
  ]);

  // --- Reset Handler ---
  const handleReset = () => {
    // Reset all input states
    setFactor("");
    setE(""); setD(""); setRe(""); setRd(""); setTc("");
    setIntExpense(""); setDebtAmt(""); setTaxD("");
    setRf(""); setBeta(""); setRm("");
    setShares(""); setInterest(""); setTaxRate(""); setEbitLe("");
    setPartitionEBIT(""); setPartitionDebt(""); setPartitionRate(""); setPartitionShares(""); setPartitionTaxRate("");
    setShieldDebt(""); setShieldInterestRate(""); setShieldTaxRate("");
    setDebtShield2(""); setTaxShield2("");
    setDebtBE(""); setIntRateBE(""); setSharesBE1(""); setSharesBE2("");

    // Optionally reset active tab/calculator
    // setMainTab("calculator");
    // setActiveCalc(metrics[0].key);

    // Clear localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="space-y-8">
      {/* Title and Reset Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Metrics Calculator</h1>
        <Button
          variant="outline"
          size="sm" // Changed from "icon" to "sm"
          onClick={handleReset}
          className="flex items-center gap-1" // Added flex classes
        >
          <RotateCcw className="h-4 w-4" /> {/* Changed icon */}
          Reset {/* Added text */}
        </Button>
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as "calculator" | "notes")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Calculator */}
        <TabsContent value="calculator" className="mt-6 space-y-6">
          {metrics.map(({ key, label }) =>
            activeCalc === key ? (
              <div key={key} className="grid gap-6 md:grid-cols-2">
                {/* Inputs Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>{label} Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* metric selector - Updated classes */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {metrics.map(m => (
                        <Button
                          key={m.key}
                          variant={m.key===activeCalc?"default":"outline"}
                          size="sm"
                          onClick={()=>setActiveCalc(m.key)}
                        >
                          {m.label}
                        </Button>
                      ))}
                    </div>

                    {/* inputs by metric */}
                    {key==="percentage-fall" && (
                      <InputGroup id="factor" label="Expansion Factor (f)" value={factor} onChange={setFactor} type="text"/>
                    )}
                    {key==="wacc" && (
                      <>
                        <InputGroup id="E"  label="Equity ($)"        value={E} onChange={setE} type="text" />
                        <InputGroup id="D"  label="Debt ($)"          value={D} onChange={setD} type="text" />
                        <InputGroup id="Re" label="Re (%)"            value={Re} onChange={setRe} type="text" suffix="%" />
                        <InputGroup id="Rd" label="Rd (%)"            value={Rd} onChange={setRd} type="text" suffix="%" />
                        <InputGroup id="Tc" label="Tax Rate (%)"      value={Tc} onChange={setTc} type="text" suffix="%" />
                      </>
                    )}
                    {key==="cost-of-debt" && (
                      <>
                        <InputGroup id="intExpense" label="Interest Expense ($)" value={intExpense} onChange={setIntExpense} type="text"/>
                        <InputGroup id="debtAmt"     label="Debt Amount ($)"      value={debtAmt}     onChange={setDebtAmt}     type="text"/>
                        <InputGroup id="taxD"        label="Tax Rate (%)"         value={taxD}        onChange={setTaxD}        type="text" suffix="%"/>
                      </>
                    )}
                    {key==="cost-of-equity" && (
                      <>
                        <InputGroup id="rf"   label="Rf (%)"  value={rf}   onChange={setRf}   type="text" suffix="%"/>
                        <InputGroup id="beta" label="Beta"    value={beta} onChange={setBeta} type="text"/>
                        <InputGroup id="rm"   label="Rm (%)"  value={rm}   onChange={setRm}   type="text" suffix="%"/>
                      </>
                    )}
                    {key==="eps" && (
                      <>
                        <InputGroup id="shares"  label="Shares"        value={shares}   onChange={setShares}   type="text"/>
                        <InputGroup id="interest" label="Interest (I$)" value={interest} onChange={setInterest} type="text"/>
                        <InputGroup id="taxRate" label="Tax Rate (%)"   value={taxRate}  onChange={setTaxRate}  type="text" suffix="%"/>
                        <InputGroup id="ebitLe"  label="EBIT ($)"      value={ebitLe}   onChange={setEbitLe}   type="text"/>
                      </>
                    )}
                    {key==="eps-partition" && (
                      <>
                        <InputGroup id="partitionEBIT"    label="EBIT ($)"              value={partitionEBIT}    onChange={setPartitionEBIT}    type="text"/>
                        <InputGroup id="partitionDebt"    label="New Debt ($)"         value={partitionDebt}    onChange={setPartitionDebt}    type="text"/>
                        <InputGroup id="partitionRate"    label="Interest Rate (%)"    value={partitionRate}    onChange={setPartitionRate}    type="text" suffix="%"/>
                        <InputGroup id="partitionShares"  label="New Shares"           value={partitionShares}  onChange={setPartitionShares}  type="text"/>
                        <InputGroup id="partitionTaxRate" label="Tax Rate (%)"         value={partitionTaxRate} onChange={setPartitionTaxRate} type="text" suffix="%"/>
                      </>
                    )}
                    {key==="annual-shield" && (
                      <>
                        <InputGroup id="shieldDebt"        label="New Debt ($)"           value={shieldDebt}        onChange={setShieldDebt}        type="text"/>
                        <InputGroup id="shieldInterestRate"label="Interest Rate (%)"      value={shieldInterestRate}onChange={setShieldInterestRate}type="text" suffix="%"/>
                        <InputGroup id="shieldTaxRate"     label="Tax Rate (%)"           value={shieldTaxRate}     onChange={setShieldTaxRate}     type="text" suffix="%"/>
                      </>
                    )}
                    {key==="value-shield" && (
                      <>
                        <InputGroup id="debtShield2" label="Debt Amount ($)" value={debtShield2} onChange={setDebtShield2} type="text"/>
                        <InputGroup id="taxShield2"  label="Tax Rate (%)"    value={taxShield2}  onChange={setTaxShield2}  type="text" suffix="%"/>
                      </>
                    )}
                    {key==="ebit-be" && (
                      <>
                        <InputGroup id="debtBE"    label="Debt Amount ($)"      value={debtBE}    onChange={setDebtBE}    type="text"/>
                        <InputGroup id="intRateBE" label="Interest Rate (%)"    value={intRateBE} onChange={setIntRateBE} type="text" suffix="%"/>
                        <InputGroup id="sharesBE1" label="Shares Unlevered"      value={sharesBE1} onChange={setSharesBE1} type="text"/>
                        <InputGroup id="sharesBE2" label="Shares Levered"        value={sharesBE2} onChange={setSharesBE2} type="text"/>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Result Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>{label} Result</CardTitle>
                  </CardHeader>
                  {/* Added text-center for centering */}
                  <CardContent className="text-center">
                    {key === "percentage-fall" &&
                      (fallResult !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">{fallResult.toFixed(2)}%</p>
                        : <Dash/>
                      )}
                    {key === "wacc" &&
                      (waccResult !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">{waccResult.toFixed(2)}%</p>
                        : <Dash/>
                      )}
                    {key === "cost-of-debt" &&
                      (codResult
                        // Applied consistent large, bold style to both lines
                        ? <>
                            <p className="text-3xl font-bold">Pre: {codResult.pre.toFixed(2)}%</p>
                            <p className="text-3xl font-bold">After: {codResult.after.toFixed(2)}%</p>
                          </>
                        : <Dash/>
                      )}
                    {key === "cost-of-equity" &&
                      (coeResult !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">{coeResult.toFixed(2)}%</p>
                        : <Dash/>
                      )}
                    {key === "eps" &&
                      (leveredEPS !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">${leveredEPS.toFixed(2)}</p>
                        : <Dash/>
                      )}
                    {key === "eps-partition" &&
                      (epsPartition !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">${epsPartition.toFixed(2)}</p>
                        : <Dash/>
                      )}
                    {key === "annual-shield" &&
                      (annualShield !== null
                        // Applied consistent large, bold style to both lines
                        ? <>
                            <p className="text-3xl font-bold">Annual: ${annualShield.toFixed(2)}</p>
                            <p className="text-3xl font-bold">PV: ${pvShield !== null ? pvShield.toFixed(2) : "—"}</p>
                          </>
                        : <Dash/>
                      )}
                    {key === "value-shield" &&
                      (valShieldResult !== null
                        // Applied consistent large, bold style
                        // Note: This formula (Debt * Tc) usually results in a monetary value, added '$'
                        ? <p className="text-3xl font-bold">${valShieldResult.toFixed(2)}</p>
                        : <Dash/>
                      )}
                    {key === "ebit-be" &&
                      (ebitBE !== null
                        // Applied consistent large, bold style
                        ? <p className="text-3xl font-bold">${ebitBE.toFixed(2)}</p>
                        : <Dash/>
                      )}
                  </CardContent>
                </Card>
              </div>
            ) : null
          )}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Formulas & Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <pre>
Percentage Fall:               1 / f × 100  
WACC:                          E/(E+D)×Re + D/(E+D)×Rd×(1−Tc)  
Cost of Debt (pre & after):    i/D ×100 ; ×(1−Tc)  
Cost of Equity (CAPM):         Re = Rf + β×(Rm−Rf)  
EPS (dynamic):                 (EBIT−I)×(1−T) / Shares  
EPS Partition:                 ((EBIT−D×r)×(1−T)) / Shares  
Annual Tax Shield:             D × r × T  
PV of Tax Shield:              AnnualShield / DiscountRate  
Value of Tax Shield:           Debt × Tc  
EBIT Breakeven:                (s₁×Debt×r) / (s₁−s₂)  
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
