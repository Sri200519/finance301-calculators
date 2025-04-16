import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";

export function RiskCalculator() {
  // ----------------------------------------------------------------
  // Overall function selection
  // ----------------------------------------------------------------
  const [activeFunction, setActiveFunction] = useState("rateReturn");
  const [activeTab, setActiveTab] = useState("calculator");

  // ----------------------------------------------------------------
  // RATE OF RETURN (with toggle between Traditional vs CAPM)
  // ----------------------------------------------------------------
  const [initialPrice, setInitialPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [dividend, setDividend] = useState("");
  const [capm_rf, setCapm_rf] = useState("");
  const [capm_marketExp, setCapm_marketExp] = useState("");
  const [capm_beta, setCapm_beta] = useState("");
  const [isCAPM, setIsCAPM] = useState(false);
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

  const calculateCAPMExpectedReturn = () => {
    const rf = Number(capm_rf) / 100;
    const marketExp = Number(capm_marketExp) / 100;
    const beta = Number(capm_beta);
    setRateOfReturn(rf + beta * (marketExp - rf));
  };

  // ----------------------------------------------------------------
  // STOCK/ MARKET RISK (Dynamic states)
  // ----------------------------------------------------------------
  const [stockStates, setStockStates] = useState([
    { stockReturn: "", probability: "" },
    { stockReturn: "", probability: "" },
    { stockReturn: "", probability: "" },
  ]);
  const [stockExpectedReturn, setStockExpectedReturn] = useState<number | null>(null);
  const [stockVariance, setStockVariance] = useState<number | null>(null);
  const [stockSD, setStockSD] = useState<number | null>(null);

  const handleStockStateChange = (
    index: number,
    field: "stockReturn" | "probability",
    value: string
  ) => {
    const newStates = [...stockStates];
    newStates[index][field] = value;
    setStockStates(newStates);
  };

  const addStockState = () => {
    setStockStates([...stockStates, { stockReturn: "", probability: "" }]);
  };

  const removeStockState = (index: number) => {
    if (stockStates.length > 2) {
      const newStates = stockStates.filter((_, i) => i !== index);
      setStockStates(newStates);
    }
  };

  const calculateStockRisk = () => {
    let expReturn = 0;
    stockStates.forEach((state) => {
      const r = Number(state.stockReturn);
      const p = Number(state.probability) / 100;
      expReturn += r * p;
    });
    setStockExpectedReturn(expReturn);

    let variance = 0;
    stockStates.forEach((state) => {
      const r = Number(state.stockReturn);
      const p = Number(state.probability) / 100;
      variance += p * Math.pow(r - expReturn, 2);
    });
    setStockVariance(variance);
    setStockSD(Math.sqrt(variance));
  };

  // ----------------------------------------------------------------
  // UNIFIED PORTFOLIO CALCULATOR (Portfolio Proportion & Standard Deviation)
  // ----------------------------------------------------------------
  const [activePortfolioMethod, setActivePortfolioMethod] =
    useState("proportion");
  const [assetValue, setAssetValue] = useState("");
  const [portfolioTotal, setPortfolioTotal] = useState("");
  const [portfolioVariance, setPortfolioVariance] = useState<number | null>(null);
  const [portfolioProportion, setPortfolioProportion] = useState<
    number | null
  >(null);
  const calculatePortfolioProportion = () => {
    const asset = Number(assetValue);
    const total = Number(portfolioTotal);
    if (total > 0) {
      setPortfolioProportion(asset / total);
    } else {
      setPortfolioProportion(null);
    }
  };

  const [portfolioSD_w1, setPortfolioSD_w1] = useState("");
  const [portfolioSD_w2, setPortfolioSD_w2] = useState("");
  const [portfolioSD_var1, setPortfolioSD_var1] = useState("");
  const [portfolioSD_var2, setPortfolioSD_var2] = useState("");
  const [portfolioSD_cov, setPortfolioSD_cov] = useState("");
  const [portfolioSD_result, setPortfolioSD_result] = useState<
    number | null
  >(null);
  const calculatePortfolioSD = () => {
    const w1 = Number(portfolioSD_w1);
    const w2 = Number(portfolioSD_w2);
    const var1 = Number(portfolioSD_var1);
    const var2 = Number(portfolioSD_var2);
    const cov = Number(portfolioSD_cov);
    const portVar = Math.pow(w1, 2) * var1 + Math.pow(w2, 2) * var2 +
      2 * w1 * w2 * cov;
    setPortfolioVariance(portVar);
    setPortfolioSD_result(Math.sqrt(portVar));
  };

  // ----------------------------------------------------------------
  // COVARIANCE (2 states)
  // ----------------------------------------------------------------
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
      p1 * (s1 - expStock) * (m1 - expMarket) +
      p2 * (s2 - expStock) * (m2 - expMarket);
    setCovariance(cov);
  };

  // ----------------------------------------------------------------
  // UNIFIED BETA CALCULATOR (combining 3 methods)
  // ----------------------------------------------------------------
  const [activeBetaMethod, setActiveBetaMethod] = useState("threeStates");
  const [betaStates, setBetaStates] = useState([
    { stockReturn: "", marketReturn: "", probability: "" },
    { stockReturn: "", marketReturn: "", probability: "" },
    { stockReturn: "", marketReturn: "", probability: "" },
  ]);
  const [betaFromCov_cov, setBetaFromCov_cov] = useState("");
  const [betaFromCov_marketSD, setBetaFromCov_marketSD] = useState("");
  const [assetBeta_debt, setAssetBeta_debt] = useState("");
  const [assetBeta_equity, setAssetBeta_equity] = useState("");
  const [assetBeta_weightDebt, setAssetBeta_weightDebt] = useState("");
  const [assetBeta_weightEquity, setAssetBeta_weightEquity] = useState("");
  const [betaResult, setBetaResult] = useState<number | null>(null);

  const handleBetaStateChange = (
    index: number,
    field: "stockReturn" | "marketReturn" | "probability",
    value: string
  ) => {
    const newStates = [...betaStates];
    newStates[index][field] = value;
    setBetaStates(newStates);
  };

  const addBetaState = () => {
    setBetaStates([
      ...betaStates,
      { stockReturn: "", marketReturn: "", probability: "" },
    ]);
  };

  const removeBetaState = (index: number) => {
    if (betaStates.length > 2) {
      setBetaStates(betaStates.filter((_, i) => i !== index));
    }
  };

  const calculateBetaThreeStates = () => {
    let expStock = 0;
    let expMarket = 0;

    betaStates.forEach((state) => {
      const sr = Number(state.stockReturn);
      const mr = Number(state.marketReturn);
      const p = Number(state.probability) / 100;
      expStock += sr * p;
      expMarket += mr * p;
    });

    let cov = 0;
    let marketVar = 0;

    betaStates.forEach((state) => {
      const sr = Number(state.stockReturn);
      const mr = Number(state.marketReturn);
      const p = Number(state.probability) / 100;
      cov += p * (sr - expStock) * (mr - expMarket);
      marketVar += p * Math.pow(mr - expMarket, 2);
    });

    setBetaResult(marketVar !== 0 ? cov / marketVar : null);
  };

  const calculateBetaFromCov = () => {
    const cov = Number(betaFromCov_cov);
    const marketSD = Number(betaFromCov_marketSD);
    const marketVar = Math.pow(marketSD, 2);
    setBetaResult(marketVar !== 0 ? cov / marketVar : null);
  };

  const calculateAssetBeta = () => {
    const betaDebt = Number(assetBeta_debt);
    const betaEquity = Number(assetBeta_equity);
    const wDebt = Number(assetBeta_weightDebt);
    const wEquity = Number(assetBeta_weightEquity);
    setBetaResult(wDebt * betaDebt + wEquity * betaEquity);
  };

  // ----------------------------------------------------------------
  // CORRELATION COEFFICIENT (dynamic economic states)
  // ----------------------------------------------------------------
  const [corrStates, setCorrStates] = useState<
    { xReturn: string; yReturn: string; probability: string }[]
  >([
    { xReturn: "", yReturn: "", probability: "" },
    { xReturn: "", yReturn: "", probability: "" },
  ]);
  const [correlationCoefficientResult, setCorrelationCoefficientResult] =
    useState<number | null>(null);

  const handleCorrStateChange = (
    index: number,
    field: "xReturn" | "yReturn" | "probability",
    value: string
  ) => {
    const newStates = [...corrStates];
    newStates[index][field] = value;
    setCorrStates(newStates);
  };

  const addCorrState = () => {
    setCorrStates([
      ...corrStates,
      { xReturn: "", yReturn: "", probability: "" },
    ]);
  };

  const removeCorrState = (index: number) => {
    if (corrStates.length > 2) {
      setCorrStates(corrStates.filter((_, i) => i !== index));
    }
  };

  const calculateCorrelationCoefficient = () => {
    // expected returns
    let expX = 0,
      expY = 0;
    corrStates.forEach((s) => {
      const xr = Number(s.xReturn);
      const yr = Number(s.yReturn);
      const p = Number(s.probability) / 100;
      expX += xr * p;
      expY += yr * p;
    });

    // covariance & variances
    let cov = 0,
      varX = 0,
      varY = 0;
    corrStates.forEach((s) => {
      const xr = Number(s.xReturn);
      const yr = Number(s.yReturn);
      const p = Number(s.probability) / 100;
      cov += p * (xr - expX) * (yr - expY);
      varX += p * Math.pow(xr - expX, 2);
      varY += p * Math.pow(yr - expY, 2);
    });

    if (varX > 0 && varY > 0) {
      setCorrelationCoefficientResult(cov / Math.sqrt(varX * varY));
    } else {
      setCorrelationCoefficientResult(null);
    }
  };

  // ----------------------------------------------------------------
  // Calculation hooks
  // ----------------------------------------------------------------
  useEffect(() => {
    if (activeFunction === "rateReturn") {
      if (isCAPM) {
        if (capm_rf && capm_marketExp && capm_beta) {
          calculateCAPMExpectedReturn();
        }
      } else {
        if (initialPrice && finalPrice && dividend) {
          calculateRateOfReturn();
        }
      }
    }
  }, [
    activeFunction,
    isCAPM,
    initialPrice,
    finalPrice,
    dividend,
    capm_rf,
    capm_marketExp,
    capm_beta,
  ]);

  useEffect(() => {
    if (activeFunction === "stockRisk") {
      calculateStockRisk();
    }
  }, [activeFunction, stockStates]);

  useEffect(() => {
    if (activeFunction === "portfolio") {
      if (activePortfolioMethod === "proportion") {
        if (assetValue && portfolioTotal) {
          calculatePortfolioProportion();
        }
      } else {
        if (
          portfolioSD_w1 &&
          portfolioSD_w2 &&
          portfolioSD_var1 &&
          portfolioSD_var2 &&
          portfolioSD_cov
        ) {
          calculatePortfolioSD();
        }
      }
    }
  }, [
    activeFunction,
    activePortfolioMethod,
    assetValue,
    portfolioTotal,
    portfolioSD_w1,
    portfolioSD_w2,
    portfolioSD_var1,
    portfolioSD_var2,
    portfolioSD_cov,
  ]);

  useEffect(() => {
    if (
      activeFunction === "covariance" &&
      covStockReturn1 &&
      covMarketReturn1 &&
      covProb1 &&
      covStockReturn2 &&
      covMarketReturn2 &&
      covProb2
    ) {
      calculateCovariance();
    }
  }, [
    activeFunction,
    covStockReturn1,
    covMarketReturn1,
    covProb1,
    covStockReturn2,
    covMarketReturn2,
    covProb2,
  ]);

  useEffect(() => {
    if (activeFunction === "beta") {
      if (activeBetaMethod === "threeStates") {
        const allFilled = betaStates.every(
          (s) => s.stockReturn && s.marketReturn && s.probability
        );
        if (allFilled) calculateBetaThreeStates();
      } else if (activeBetaMethod === "fromCov") {
        if (betaFromCov_cov && betaFromCov_marketSD) {
          calculateBetaFromCov();
        }
      } else {
        if (
          assetBeta_debt &&
          assetBeta_equity &&
          assetBeta_weightDebt &&
          assetBeta_weightEquity
        ) {
          calculateAssetBeta();
        }
      }
    }
  }, [
    activeFunction,
    activeBetaMethod,
    betaStates,
    betaFromCov_cov,
    betaFromCov_marketSD,
    assetBeta_debt,
    assetBeta_equity,
    assetBeta_weightDebt,
    assetBeta_weightEquity,
  ]);

  useEffect(() => {
    if (activeFunction === "correlationCoefficient") {
      const allFilled = corrStates.every(
        (s) => s.xReturn && s.yReturn && s.probability
      );
      if (allFilled) {
        calculateCorrelationCoefficient();
      }
    }
  }, [activeFunction, corrStates]);

  // ----------------------------------------------------------------
  // LOCAL STORAGE HANDLING
  // ----------------------------------------------------------------
  const LOCAL_STORAGE_KEY = "riskCalculatorState";
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
        setCapm_rf(parsed.capm_rf ?? "");
        setCapm_marketExp(parsed.capm_marketExp ?? "");
        setCapm_beta(parsed.capm_beta ?? "");
        setIsCAPM(parsed.isCAPM ?? false);

        setStockStates(parsed.stockStates ?? [
          { stockReturn: "", probability: "" },
          { stockReturn: "", probability: "" },
          { stockReturn: "", probability: "" },
        ]);

        setActivePortfolioMethod(parsed.activePortfolioMethod ?? "proportion");
        setAssetValue(parsed.assetValue ?? "");
        setPortfolioTotal(parsed.portfolioTotal ?? "");
        setPortfolioSD_w1(parsed.portfolioSD_w1 ?? "");
        setPortfolioSD_w2(parsed.portfolioSD_w2 ?? "");
        setPortfolioSD_var1(parsed.portfolioSD_var1 ?? "");
        setPortfolioSD_var2(parsed.portfolioSD_var2 ?? "");
        setPortfolioSD_cov(parsed.portfolioSD_cov ?? "");

        setCovStockReturn1(parsed.covStockReturn1 ?? "");
        setCovMarketReturn1(parsed.covMarketReturn1 ?? "");
        setCovProb1(parsed.covProb1 ?? "");
        setCovStockReturn2(parsed.covStockReturn2 ?? "");
        setCovMarketReturn2(parsed.covMarketReturn2 ?? "");
        setCovProb2(parsed.covProb2 ?? "");

        setActiveBetaMethod(parsed.activeBetaMethod ?? "threeStates");
        setBetaStates(parsed.betaStates ?? [
          { stockReturn: "", marketReturn: "", probability: "" },
          { stockReturn: "", marketReturn: "", probability: "" },
          { stockReturn: "", marketReturn: "", probability: "" },
        ]);
        setBetaFromCov_cov(parsed.betaFromCov_cov ?? "");
        setBetaFromCov_marketSD(parsed.betaFromCov_marketSD ?? "");
        setAssetBeta_debt(parsed.assetBeta_debt ?? "");
        setAssetBeta_equity(parsed.assetBeta_equity ?? "");
        setAssetBeta_weightDebt(parsed.assetBeta_weightDebt ?? "");
        setAssetBeta_weightEquity(parsed.assetBeta_weightEquity ?? "");

        setCorrStates(parsed.corrStates ?? [
          { xReturn: "", yReturn: "", probability: "" },
          { xReturn: "", yReturn: "", probability: "" },
        ]);
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      activeFunction,
      activeTab,
      initialPrice,
      finalPrice,
      dividend,
      capm_rf,
      capm_marketExp,
      capm_beta,
      isCAPM,
      stockStates,
      activePortfolioMethod,
      assetValue,
      portfolioTotal,
      portfolioSD_w1,
      portfolioSD_w2,
      portfolioSD_var1,
      portfolioSD_var2,
      portfolioSD_cov,
      covStockReturn1,
      covMarketReturn1,
      covProb1,
      covStockReturn2,
      covMarketReturn2,
      covProb2,
      activeBetaMethod,
      betaStates,
      betaFromCov_cov,
      betaFromCov_marketSD,
      assetBeta_debt,
      assetBeta_equity,
      assetBeta_weightDebt,
      assetBeta_weightEquity,
      corrStates,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    activeFunction,
    activeTab,
    initialPrice,
    finalPrice,
    dividend,
    capm_rf,
    capm_marketExp,
    capm_beta,
    isCAPM,
    stockStates,
    activePortfolioMethod,
    assetValue,
    portfolioTotal,
    portfolioSD_w1,
    portfolioSD_w2,
    portfolioSD_var1,
    portfolioSD_var2,
    portfolioSD_cov,
    covStockReturn1,
    covMarketReturn1,
    covProb1,
    covStockReturn2,
    covMarketReturn2,
    covProb2,
    activeBetaMethod,
    betaStates,
    betaFromCov_cov,
    betaFromCov_marketSD,
    assetBeta_debt,
    assetBeta_equity,
    assetBeta_weightDebt,
    assetBeta_weightEquity,
    corrStates,
  ]);

  // ----------------------------------------------------------------
  // RESET HANDLER
  // ----------------------------------------------------------------
  const handleReset = () => {
    setActiveFunction("rateReturn");
    setActiveTab("calculator");
    setInitialPrice("");
    setFinalPrice("");
    setDividend("");
    setRateOfReturn(null);
    setCapm_rf("");
    setCapm_marketExp("");
    setCapm_beta("");
    setIsCAPM(false);

    setStockStates([
      { stockReturn: "", probability: "" },
      { stockReturn: "", probability: "" },
      { stockReturn: "", probability: "" },
    ]);
    setStockExpectedReturn(null);
    setStockVariance(null);
    setStockSD(null);

    setActivePortfolioMethod("proportion");
    setAssetValue("");
    setPortfolioTotal("");
    setPortfolioProportion(null);
    setPortfolioSD_w1("");
    setPortfolioSD_w2("");
    setPortfolioSD_var1("");
    setPortfolioSD_var2("");
    setPortfolioSD_cov("");
    setPortfolioSD_result(null);

    setCovStockReturn1("");
    setCovMarketReturn1("");
    setCovProb1("");
    setCovStockReturn2("");
    setCovMarketReturn2("");
    setCovProb2("");

    setActiveBetaMethod("threeStates");
    setBetaStates([
      { stockReturn: "", marketReturn: "", probability: "" },
      { stockReturn: "", marketReturn: "", probability: "" },
      { stockReturn: "", marketReturn: "", probability: "" },
    ]);
    setBetaFromCov_cov("");
    setBetaFromCov_marketSD("");
    setAssetBeta_debt("");
    setAssetBeta_equity("");
    setAssetBeta_weightDebt("");
    setAssetBeta_weightEquity("");
    setBetaResult(null);

    setCorrStates([
      { xReturn: "", yReturn: "", probability: "" },
      { xReturn: "", yReturn: "", probability: "" },
    ]);
    setCorrelationCoefficientResult(null);

    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // ----------------------------------------------------------------
  // RENDER INPUTS
  // ----------------------------------------------------------------
  const renderInputs = () => {
    switch (activeFunction) {
      case "rateReturn":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={!isCAPM ? "default" : "outline"}
                onClick={() => setIsCAPM(false)}
              >
                Traditional
              </Button>
              <Button
                variant={isCAPM ? "default" : "outline"}
                onClick={() => setIsCAPM(true)}
              >
                CAPM
              </Button>
            </div>
            {!isCAPM ? (
              <>
                <InputGroup
                  id="initialPrice"
                  label="Initial Price"
                  value={initialPrice}
                  onChange={setInitialPrice}
                  type="text"
                  prefix="$"
                />
                <InputGroup
                  id="finalPrice"
                  label="Final Price"
                  value={finalPrice}
                  onChange={setFinalPrice}
                  type="text"
                  prefix="$"
                />
                <InputGroup
                  id="dividend"
                  label="Dividend"
                  value={dividend}
                  onChange={setDividend}
                  type="text"
                  prefix="$"
                />
              </>
            ) : (
              <>
                <InputGroup
                  id="capm_rf"
                  label="Risk-Free Rate"
                  value={capm_rf}
                  onChange={setCapm_rf}
                  type="text"
                  suffix="%"
                />
                <InputGroup
                  id="capm_marketExp"
                  label="Market Expected Return"
                  value={capm_marketExp}
                  onChange={setCapm_marketExp}
                  type="text"
                  suffix="%"
                />
                <InputGroup
                  id="capm_beta"
                  label="Asset Beta"
                  value={capm_beta}
                  onChange={setCapm_beta}
                  type="text"
                />
              </>
            )}
          </div>
        );

      case "stockRisk":
        return (
          <div className="space-y-4">
            {stockStates.map((s, i) => (
              <div key={i} className="flex gap-2">
                <InputGroup
                  id={`sr${i}`}
                  label={`Return State ${i + 1}`}
                  value={s.stockReturn}
                  onChange={(v) =>
                    handleStockStateChange(i, "stockReturn", v)
                  }
                  type="text"
                />
                <InputGroup
                  id={`sp${i}`}
                  label={`Prob ${i + 1}`}
                  value={s.probability}
                  onChange={(v) =>
                    handleStockStateChange(i, "probability", v)
                  }
                  type="text"
                  suffix="%"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={addStockState}>Add State</Button>
              <Button
                variant={stockStates.length > 2 ? "default" : "outline"}
                disabled={stockStates.length <= 2}
                onClick={() => removeStockState(stockStates.length - 1)}
              >
                Remove State
              </Button>
            </div>
          </div>
        );

      case "portfolio":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={
                  activePortfolioMethod === "proportion" ? "default" : "outline"
                }
                onClick={() => setActivePortfolioMethod("proportion")}
              >
                Proportion
              </Button>
              <Button
                variant={activePortfolioMethod === "sd" ? "default" : "outline"}
                onClick={() => setActivePortfolioMethod("sd")}
              >
                Standard Deviation
              </Button>
            </div>
            {activePortfolioMethod === "proportion" ? (
              <>
                <InputGroup
                  id="assetValue"
                  label="Asset Value"
                  value={assetValue}
                  onChange={setAssetValue}
                  type="text"
                  prefix="$"
                />
                <InputGroup
                  id="portfolioTotal"
                  label="Total Portfolio Value"
                  value={portfolioTotal}
                  onChange={setPortfolioTotal}
                  type="text"
                  prefix="$"
                />
              </>
            ) : (
              <>
                <InputGroup
                  id="portfolioSD_w1"
                  label="Weight 1"
                  value={portfolioSD_w1}
                  onChange={setPortfolioSD_w1}
                  type="text"
                />
                <InputGroup
                  id="portfolioSD_w2"
                  label="Weight 2"
                  value={portfolioSD_w2}
                  onChange={setPortfolioSD_w2}
                  type="text"
                />
                <InputGroup
                  id="portfolioSD_var1"
                  label="Variance 1"
                  value={portfolioSD_var1}
                  onChange={setPortfolioSD_var1}
                  type="text"
                />
                <InputGroup
                  id="portfolioSD_var2"
                  label="Variance 2"
                  value={portfolioSD_var2}
                  onChange={setPortfolioSD_var2}
                  type="text"
                />
                <InputGroup
                  id="portfolioSD_cov"
                  label="Covariance"
                  value={portfolioSD_cov}
                  onChange={setPortfolioSD_cov}
                  type="text"
                />
              </>
            )}
          </div>
        );

      case "covariance":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <InputGroup
                id="covStockReturn1"
                label="Stock Return 1"
                value={covStockReturn1}
                onChange={setCovStockReturn1}
                type="text"
              />
              <InputGroup
                id="covMarketReturn1"
                label="Market Return 1"
                value={covMarketReturn1}
                onChange={setCovMarketReturn1}
                type="text"
              />
              <InputGroup
                id="covProb1"
                label="Probability 1"
                value={covProb1}
                onChange={setCovProb1}
                type="text"
                suffix="%"
              />
              <InputGroup
                id="covStockReturn2"
                label="Stock Return 2"
                value={covStockReturn2}
                onChange={setCovStockReturn2}
                type="text"
              />
              <InputGroup
                id="covMarketReturn2"
                label="Market Return 2"
                value={covMarketReturn2}
                onChange={setCovMarketReturn2}
                type="text"
              />
              <InputGroup
                id="covProb2"
                label="Probability 2"
                value={covProb2}
                onChange={setCovProb2}
                type="text"
                suffix="%"
              />
            </div>
          </div>
        );

      case "beta":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={
                  activeBetaMethod === "threeStates" ? "default" : "outline"
                }
                onClick={() => setActiveBetaMethod("threeStates")}
              >
                3 States
              </Button>
              <Button
                variant={
                  activeBetaMethod === "fromCov" ? "default" : "outline"
                }
                onClick={() => setActiveBetaMethod("fromCov")}
              >
                Cov & SD
              </Button>
              <Button
                variant={
                  activeBetaMethod === "assetBeta" ? "default" : "outline"
                }
                onClick={() => setActiveBetaMethod("assetBeta")}
              >
                Asset Beta
              </Button>
            </div>

            {activeBetaMethod === "threeStates" && (
              <div className="space-y-4">
                {betaStates.map((state, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <InputGroup
                      id={`beta_stockReturn_${i}`}
                      label={`Stock Return ${i + 1}`}
                      value={state.stockReturn}
                      onChange={(val) =>
                        handleBetaStateChange(i, "stockReturn", val)
                      }
                      type="text"
                    />
                    <InputGroup
                      id={`beta_marketReturn_${i}`}
                      label={`Market Return ${i + 1}`}
                      value={state.marketReturn}
                      onChange={(val) =>
                        handleBetaStateChange(i, "marketReturn", val)
                      }
                      type="text"
                    />
                    <InputGroup
                      id={`beta_prob_${i}`}
                      label={`Probability ${i + 1}`}
                      value={state.probability}
                      onChange={(val) =>
                        handleBetaStateChange(i, "probability", val)
                      }
                      type="text"
                      suffix="%"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={addBetaState}>Add State</Button>
                  <Button
                    variant={betaStates.length > 2 ? "default" : "outline"}
                    disabled={betaStates.length <= 2}
                    onClick={() =>
                      removeBetaState(betaStates.length - 1)
                    }
                  >
                    Remove State
                  </Button>
                </div>
              </div>
            )}

            {activeBetaMethod === "fromCov" && (
              <>
                <InputGroup
                  id="betaFromCov_cov"
                  label="Covariance"
                  value={betaFromCov_cov}
                  onChange={(val) => setBetaFromCov_cov(val)}
                  type="text"
                />
                <InputGroup
                  id="betaFromCov_marketSD"
                  label="Market SD"
                  value={betaFromCov_marketSD}
                  onChange={(val) => setBetaFromCov_marketSD(val)}
                  type="text"
                />
              </>
            )}

            {activeBetaMethod === "assetBeta" && (
              <>
                <InputGroup
                  id="assetBeta_debt"
                  label="Debt Beta"
                  value={assetBeta_debt}
                  onChange={(val) => setAssetBeta_debt(val)}
                  type="text"
                />
                <InputGroup
                  id="assetBeta_equity"
                  label="Equity Beta"
                  value={assetBeta_equity}
                  onChange={(val) => setAssetBeta_equity(val)}
                  type="text"
                />
                <InputGroup
                  id="assetBeta_weightDebt"
                  label="Weight Debt"
                  value={assetBeta_weightDebt}
                  onChange={(val) => setAssetBeta_weightDebt(val)}
                  type="text"
                />
                <InputGroup
                  id="assetBeta_weightEquity"
                  label="Weight Equity"
                  value={assetBeta_weightEquity}
                  onChange={(val) => setAssetBeta_weightEquity(val)}
                  type="text"
                />
              </>
            )}
          </div>
        );

      case "correlationCoefficient":
        return (
          <div className="space-y-4">
            {corrStates.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <InputGroup
                  id={`corr_xReturn_${i}`}
                  label={`Return X ${i + 1}`}
                  value={s.xReturn}
                  onChange={(v) =>
                    handleCorrStateChange(i, "xReturn", v)
                  }
                  type="text"
                />
                <InputGroup
                  id={`corr_yReturn_${i}`}
                  label={`Return Y ${i + 1}`}
                  value={s.yReturn}
                  onChange={(v) =>
                    handleCorrStateChange(i, "yReturn", v)
                  }
                  type="text"
                />
                <InputGroup
                  id={`corr_prob_${i}`}
                  label={`Probability ${i + 1}`}
                  value={s.probability}
                  onChange={(v) =>
                    handleCorrStateChange(i, "probability", v)
                  }
                  type="text"
                  suffix="%"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={addCorrState}>Add State</Button>
              <Button
                variant={corrStates.length > 2 ? "default" : "outline"}
                disabled={corrStates.length <= 2}
                onClick={() =>
                  removeCorrState(corrStates.length - 1)
                }
              >
                Remove State
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ----------------------------------------------------------------
  // RENDER OUTPUT
  // ----------------------------------------------------------------
  const renderOutput = () => {
    switch (activeFunction) {
      case "rateReturn":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isCAPM ? "Expected Return (CAPM)" : "Rate of Return"}
            </div>
            <div className="text-3xl font-bold">
              {rateOfReturn !== null
                ? `${(rateOfReturn * 100).toFixed(2)}%`
                : "—"}
            </div>
          </div>
        );

      case "stockRisk":
        return (
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Expected Return:
              </span>
              <span className="text-lg font-medium">
                {stockExpectedReturn !== null
                  ? `${(stockExpectedReturn * 100).toFixed(2)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Variance:
              </span>
              <span className="text-lg font-medium">
                {stockVariance !== null
                  ? stockVariance.toFixed(4)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Standard Deviation:
              </span>
              <span className="text-lg font-medium">
                {stockSD !== null ? stockSD.toFixed(4) : "—"}
              </span>
            </div>
          </div>
        );

        case "portfolio":
          return (
            <div className="space-y-4 w-full">
              {activePortfolioMethod === "proportion" ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Portfolio Proportion
                  </div>
                  <div className="text-3xl font-bold">
                    {portfolioProportion !== null
                      ? `${(portfolioProportion * 100).toFixed(2)}%`
                      : "—"}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Portfolio Variance:
                    </span>
                    <span className="text-lg font-medium">
                      {portfolioVariance !== null ? portfolioVariance.toFixed(4) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Portfolio Standard Deviation:
                    </span>
                    <span className="text-lg font-medium">
                      {portfolioSD_result !== null ? portfolioSD_result.toFixed(4) : "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );

      case "covariance":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Covariance
            </div>
            <div className="text-3xl font-bold">
              {covariance !== null ? covariance.toFixed(4) : "—"}
            </div>
          </div>
        );

      case "beta":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {activeBetaMethod === "threeStates"
                ? "Beta from States"
                : activeBetaMethod === "fromCov"
                ? "Beta from Cov & SD"
                : "Asset Beta"}
            </div>
            <div className="text-3xl font-bold">
              {betaResult !== null ? betaResult.toFixed(4) : "—"}
            </div>
          </div>
        );

      case "correlationCoefficient":
        return (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Correlation Coefficient
            </div>
            <div className="text-3xl font-bold">
              {correlationCoefficientResult !== null
                ? correlationCoefficientResult.toFixed(4)
                : "—"}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ----------------------------------------------------------------
  // RENDER FUNCTION BUTTONS
  // ----------------------------------------------------------------
  const renderButtons = () => (
    <div className="grid grid-cols-3 gap-2 w-full">
      <Button
        variant={activeFunction === "rateReturn" ? "default" : "outline"}
        onClick={() => setActiveFunction("rateReturn")}
      >
        Rate of Return
      </Button>
      <Button
        variant={activeFunction === "stockRisk" ? "default" : "outline"}
        onClick={() => setActiveFunction("stockRisk")}
      >
        Stock/Market Risk
      </Button>
      <Button
        variant={activeFunction === "portfolio" ? "default" : "outline"}
        onClick={() => setActiveFunction("portfolio")}
      >
        Portfolio
      </Button>
      <Button
        variant={activeFunction === "covariance" ? "default" : "outline"}
        onClick={() => setActiveFunction("covariance")}
      >
        Covariance
      </Button>
      <Button
        variant={activeFunction === "beta" ? "default" : "outline"}
        onClick={() => setActiveFunction("beta")}
      >
        Beta
      </Button>
      <Button
        variant={
          activeFunction === "correlationCoefficient" ? "default" : "outline"
        }
        onClick={() => setActiveFunction("correlationCoefficient")}
      >
        Correlation Coefficient
      </Button>
    </div>
  );

  // ----------------------------------------------------------------
  // RENDER COMPONENT
  // ----------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header and Global Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Risk Calculator
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Calculate various risk metrics including rate of return, stock risk,
            portfolio measures, beta calculations, and more.
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="notes">Notes & Formulas</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <Card className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Inputs</CardTitle>
                <CardDescription>
                  Select a calculation type and enter your values
                </CardDescription>
              </CardHeader>
              {renderButtons()}
              {renderInputs()}
            </div>

            <div className="border-l p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {{
                    rateReturn: isCAPM
                      ? "Expected Return (CAPM)"
                      : "Rate of Return",
                    stockRisk: "Stock/Market Risk Metrics",
                    portfolio:
                      activePortfolioMethod === "proportion"
                        ? "Portfolio Proportion"
                        : "Portfolio Standard Deviation",
                    covariance: "Covariance",
                    beta: "Unified Beta Calculator",
                    correlationCoefficient: "Correlation Coefficient",
                  }[activeFunction]}
                </CardDescription>
              </CardHeader>
              <div className="flex h-full flex-col items-center justify-center py-6">
                <div className="w-full">{renderOutput()}</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Formulas</CardTitle>
              <CardDescription>
                Review the formulas and key insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Formulas</h3>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Rate of Return</strong>: (Dividend + (Final Price -
                    Initial Price)) / Initial Price
                  </li>
                  <li>
                    <strong>Expected Return</strong>: Σ (Probability × Return)
                  </li>
                  <li>
                    <strong>Variance</strong>: Σ (Probability × (Return -
                    Expected Return)²)
                  </li>
                  <li>
                    <strong>Standard Deviation</strong>: √(Variance)
                  </li>
                  <li>
                    <strong>Portfolio Proportion</strong>: Asset Value /
                    Total Portfolio Value
                  </li>
                  <li>
                    <strong>Portfolio SD</strong>: √[w₁²·var₁ + w₂²·var₂ +
                    2·w₁·w₂·cov]
                  </li>
                  <li>
                    <strong>Covariance</strong>: Σ (Probability × (Return₁ -
                    ExpReturn₁) × (Return₂ - ExpReturn₂))
                  </li>
                  <li>
                    <strong>Beta (from Cov & Market SD)</strong>: Covariance /
                    (Market SD)²
                  </li>
                  <li>
                    <strong>Beta (from States)</strong>: Covariance(stock,
                    market) / Variance(market)
                  </li>
                  <li>
                    <strong>Asset Beta</strong>: Weight_debt·β_debt +
                    Weight_equity·β_equity
                  </li>
                  <li>
                    <strong>Expected Return (CAPM)</strong>: Rf + β·(E(Rm) -
                    Rf)
                  </li>
                  <li>
                    <strong>Correlation Coefficient</strong>: Covariance / (SD₁
                    · SD₂)
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                    Key Insights
                  </h3>
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>Enter probabilities as percentages (e.g. 33 for 33%).</li>
                    <li>
                      For Stock/Market Risk, Beta, and Correlation, you can add
                      or remove states (minimum 2) dynamically.
                    </li>
                    <li>Toggle among calculation methods for beta and portfolio metrics.</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-semibold">Common Applications</h3>
                <p className="mb-4 text-sm">
                  These risk metrics are widely used in portfolio management,
                  asset pricing, and performance evaluation.
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>
                    <strong>Portfolio Management</strong>: Diversification,
                    risk balancing, and asset allocation.
                  </li>
                  <li>
                    <strong>Asset Valuation</strong>: Determining expected
                    returns with CAPM.
                  </li>
                  <li>
                    <strong>Risk Analysis</strong>: Understanding volatility
                    and correlations.
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
