"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// dashboard sections
import TopSummaryBar from "@/app/components/dashboard/TopSummaryBar";
import ExpensesSection from "@/app/components/dashboard/ExpensesSection";
import GoalsIncomeSection from "@/app/components/dashboard/GoalsIncomeSection";
import InvestmentsSection from "@/app/components/dashboard/InvestmentsSection";
import DebtsAssetsSection from "@/app/components/dashboard/DebtsAssetsSection";
import RecommendationsSection from "@/app/components/dashboard/RecommendationsSection";

// ------------------ Expense categories ------------------
const expenseCategories = [
  "Food & Beverage",
  "Groceries",
  "Rent",
  "Transport",
  "Entertainment",
  "Electricity Bill",
  "Water Bill",
  "Internet",
  "Cable / Streaming Services",
  "Cell Phone Bill",
  "Car Maintenance",
  "Car Payments",
  "Gasoline / Fuel",
  "Home Loan EMI",
  "Insurance (Health / Auto / Home)",
  "Medical & Healthcare",
  "Education",
  "Gifts & Donations",
  "Travel",
  "Miscellaneous",
];

const fixedCategories = new Set([
  "Rent",
  "Electricity Bill",
  "Water Bill",
  "Internet",
  "Cable / Streaming Services",
  "Cell Phone Bill",
  "Car Payments",
  "Home Loan EMI",
  "Insurance (Health / Auto / Home)",
]);

// ---------- helper functions ----------
function calcRequiredMonthly(
  goalAmount: number | string,
  annualRatePercent: number | string,
  years: number | string
) {
  const amount = Number(goalAmount) || 0;
  const yrs = Number(years) || 0;
  const annualRate = Number(annualRatePercent) / 100 || 0;
  if (!amount || !yrs) return 0;

  const months = yrs * 12;
  if (!annualRate) return amount / months;

  const r = annualRate / 12;
  const factor = Math.pow(1 + r, months);
  return (amount * r) / (factor - 1);
}

function calcFutureValue(
  monthlyAmount: number | string,
  annualRatePercent: number | string,
  years: number | string
) {
  const m = Number(monthlyAmount) || 0;
  const yrs = Number(years) || 0;
  const annualRate = Number(annualRatePercent) / 100 || 0;
  if (!m || !yrs) return 0;

  const months = yrs * 12;
  if (!annualRate) return m * months;

  const r = annualRate / 12;
  const factor = Math.pow(1 + r, months);
  return m * ((factor - 1) / r);
}

// ---------- initial state objects ----------
const initialDebts = {
  mortgage: "",
  carLoan: "",
  creditCards: "",
  personalLoan: "",
  studentLoan: "",
  otherDebt: "",
  numberOfCreditCards: "",
  highestCardAPR: "",
  avgDebtAPR: "",
};

const initialAssets = {
  cash: "",
  savingsAccount: "",
  checkingAccount: "",
  hsa: "",
  investments: "",
  retirement: "",
  property: "",
  otherAssets: "",
};

const initialGoals = {
  shortTerm: "",
  longTerm: "",
  vacation: "",
  holidays: "",
  retirementTargetAmount: "",
  retirementYearsFromNow: "",
};

const initialIncome = {
  monthlyGross: "",
  monthlyNet: "",
  currentMonthlySavings: "",
  savingsIncreasePercent: "",
  savingsIncreaseYears: "",
};

const initialInvesting = {
  currentHoldings: "",
  riskTolerance: "",
  expectedAnnualReturn: "",
  monthlyInvestForGoals: "",
  houseGoalAmount: "",
  houseGoalYears: "",
  educationGoalAmount: "",
  educationGoalYears: "",
};

export default function Home() {
  const router = useRouter();

  // ------------------ Auth ------------------
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // ------------------ Core state ------------------
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const [expenses, setExpenses] = useState<
    { id: number; category: string; amount: number; date: string; notes: string }[]
  >([]);

  const [debts, setDebts] = useState<typeof initialDebts>(initialDebts);
  const [assets, setAssets] = useState<typeof initialAssets>(initialAssets);
  const [goals, setGoals] = useState<typeof initialGoals>(initialGoals);
  const [income, setIncome] = useState<typeof initialIncome>(initialIncome);
  const [investing, setInvesting] = useState<typeof initialInvesting>(
    initialInvesting
  );

  // ------------------ Auth listeners ------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setAuthUser(user || null);
      setAuthLoading(false);

      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (err) {
          console.error("Failed to refresh session cookie", err);
        }
      }
    });

    return () => unsub();
  }, []);

  // Load data OR clear it when user logs out
  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      // No user: clear dashboard data so everything shows as 0 / empty
      setExpenses([]);
      setDebts(initialDebts);
      setAssets(initialAssets);
      setGoals(initialGoals);
      setIncome(initialIncome);
      setInvesting(initialInvesting);
      setSaveStatus(null);
      setLoadingData(false);
      return;
    }

    async function loadUserData() {
      if (!authUser) return;

      setLoadingData(true);
      try {
        const ref = doc(firebaseDb, "users", authUser.uid, "profile", "main");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.expenses) setExpenses(data.expenses);
          if (data.debts) setDebts(data.debts);
          if (data.assets) setAssets(data.assets);
          if (data.goals) setGoals(data.goals);
          if (data.income) setIncome(data.income);
          if (data.investing) setInvesting(data.investing);
        }

        setSaveStatus("All changes saved");
      } catch (err) {
        console.error("Failed to load user data", err);
        setSaveStatus("Could not load your data");
      } finally {
        setLoadingData(false);
      }
    }

    loadUserData();
  }, [authUser, authLoading]);

  // ------------------ derived values ------------------
  const expensesSorted = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        if (!a.date) return -1;
        if (!b.date) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [expenses]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter((exp) => {
        if (!exp.date) return false;
        const d = new Date(exp.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth
        );
      }),
    [expenses, currentYear, currentMonth]
  );

  const { fixedSpending, variableSpending } = useMemo(() => {
    let fixed = 0;
    let variable = 0;
    currentMonthExpenses.forEach((exp) => {
      if (fixedCategories.has(exp.category)) {
        fixed += Number(exp.amount) || 0;
      } else {
        variable += Number(exp.amount) || 0;
      }
    });
    return { fixedSpending: fixed, variableSpending: variable };
  }, [currentMonthExpenses]);

  const totalDebts = useMemo(
    () =>
      (
        ["mortgage", "carLoan", "creditCards", "personalLoan", "studentLoan", "otherDebt"] as const
      ).reduce((sum, key) => sum + (Number((debts as any)[key]) || 0), 0),
    [debts]
  );

  const totalAssets = useMemo(
    () => Object.values(assets).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [assets]
  );

  const netWorth = totalAssets - totalDebts;

  const monthlyNet = Number(income.monthlyNet) || 0;
  const monthlySavings = Number(income.currentMonthlySavings) || 0;
  const savingsRate = monthlyNet > 0 ? monthlySavings / monthlyNet : 0;

  const savingsIncreasePercent = Number(income.savingsIncreasePercent) || 0;
  const savingsIncreaseYears = Number(income.savingsIncreaseYears) || 0;

  const projectedMonthlySavings =
    monthlySavings > 0 && savingsIncreasePercent > 0 && savingsIncreaseYears > 0
      ? monthlySavings * Math.pow(1 + savingsIncreasePercent / 100, savingsIncreaseYears)
      : monthlySavings;

  const retirementTargetAmount = Number(goals.retirementTargetAmount) || 0;
  const retirementYearsFromNow = Number(goals.retirementYearsFromNow) || 0;

  const emergencyFund =
    (Number(assets.cash) || 0) +
    (Number(assets.savingsAccount) || 0) +
    (Number(assets.checkingAccount) || 0);

  const recommendedEmergencyFund = monthlyNet > 0 ? monthlyNet * 3 : 0;

  const expectedAnnualReturnRate = Number(investing.expectedAnnualReturn) || 0;
  const monthlyInvestForGoals = Number(investing.monthlyInvestForGoals) || 0;

  const houseGoalAmount = Number(investing.houseGoalAmount) || 0;
  const houseGoalYears = Number(investing.houseGoalYears) || 0;
  const educationGoalAmount = Number(investing.educationGoalAmount) || 0;
  const educationGoalYears = Number(investing.educationGoalYears) || 0;

  const requiredMonthlyRetirement = calcRequiredMonthly(
    retirementTargetAmount,
    expectedAnnualReturnRate,
    retirementYearsFromNow
  );
  const projectedRetirementFV = calcFutureValue(
    monthlySavings,
    expectedAnnualReturnRate,
    retirementYearsFromNow
  );

  const requiredMonthlyHouse = calcRequiredMonthly(
    houseGoalAmount,
    expectedAnnualReturnRate,
    houseGoalYears
  );
  const projectedHouseFV = calcFutureValue(
    monthlyInvestForGoals,
    expectedAnnualReturnRate,
    houseGoalYears
  );

  const requiredMonthlyEducation = calcRequiredMonthly(
    educationGoalAmount,
    expectedAnnualReturnRate,
    educationGoalYears
  );
  const projectedEducationFV = calcFutureValue(
    monthlyInvestForGoals,
    expectedAnnualReturnRate,
    educationGoalYears
  );

  const totalCurrentMonthSpending = fixedSpending + variableSpending;
  const needsMax = monthlyNet * 0.5;
  const wantsMax = monthlyNet * 0.3;
  const savingsMin = monthlyNet * 0.2;

  const needsPercentOfIncome = monthlyNet ? (fixedSpending / monthlyNet) * 100 : 0;
  const wantsPercentOfIncome = monthlyNet ? (variableSpending / monthlyNet) * 100 : 0;
  const savingsPercentOfIncome = monthlyNet ? (monthlySavings / monthlyNet) * 100 : 0;

  let fiftyStatus = "Not enough data yet";
  let fiftyStatusClass = "badge-neutral";

  if (monthlyNet > 0) {
    const needsOk = needsPercentOfIncome <= 55;
    const wantsOk = wantsPercentOfIncome <= 35;
    const savingsOk = savingsPercentOfIncome >= 15;

    if (needsOk && wantsOk && savingsOk) {
      fiftyStatus = "Roughly within 50/30/20 guidelines";
      fiftyStatusClass = "badge-good";
    } else {
      fiftyStatus = "Outside 50/30/20 — review spending mix";
      fiftyStatusClass = "badge-warn";
    }
  }

  // ------------------ auto-save profile/main + summary ------------------
  useEffect(() => {
    if (!authUser) return;
    if (loadingData) return;

    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        setSaveStatus("Saving…");

        // Detailed data in sub-collection
        const profileRef = doc(firebaseDb, "users", authUser.uid, "profile", "main");
        await setDoc(
          profileRef,
          {
            expenses,
            debts,
            assets,
            goals,
            income,
            investing,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Summary document
        const summaryRef = doc(firebaseDb, "users", authUser.uid);
        await setDoc(
          summaryRef,
          {
            name: authUser.displayName || "",
            email: authUser.email ?? null,
            netWorth,
            netAssets: totalAssets,
            netDebts: totalDebts,
            snapshotUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        setSaveStatus("All changes saved");
      } catch (err) {
        console.error("Failed to save user data", err);
        setSaveStatus("Could not save changes");
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    authUser,
    loadingData,
    expenses,
    debts,
    assets,
    goals,
    income,
    investing,
    netWorth,
    totalAssets,
    totalDebts,
  ]);

  async function handleLogout() {
    try {
      await signOut(firebaseAuth);
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/login");
    }
  }

  // ------------------ handlers ------------------
  function handleDebtChange(field: keyof typeof debts, value: string) {
    setDebts((prev) => ({ ...prev, [field]: value }));
  }

  function handleAssetChange(field: keyof typeof assets, value: string) {
    setAssets((prev) => ({ ...prev, [field]: value }));
  }

  function handleGoalsChange(field: keyof typeof goals, value: string) {
    setGoals((prev) => ({ ...prev, [field]: value }));
  }

  function handleIncomeChange(field: keyof typeof income, value: string) {
    setIncome((prev) => ({ ...prev, [field]: value }));
  }

  function handleInvestingChange(field: keyof typeof investing, value: string) {
    setInvesting((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();

    if (!category || !amount || Number(amount) <= 0 || !date) {
      alert("Please fill category, amount, and date.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      category,
      amount: Number(amount),
      date,
      notes: notes.trim(),
    };

    setExpenses((prev) => [...prev, newExpense]);
    setAmount("");
    setDate("");
    setNotes("");
  }

  function handleDeleteExpense(id: number) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  // ------------------ recommendations (unchanged) ------------------
  const recommendations = useMemo(() => {
    const recs: string[] = [];
  
    // 0) Not enough data at all
    const hasAnyMoneyData =
      monthlyNet > 0 ||
      monthlySavings > 0 ||
      totalAssets > 0 ||
      totalDebts > 0 ||
      totalCurrentMonthSpending > 0;
  
    if (!hasAnyMoneyData) {
      recs.push(
        "Start by entering your income, savings, debts, assets, and at least a few recent expenses. Once there’s data, I’ll generate more detailed recommendations."
      );
      return recs;
    }
  
    // 1) Emergency fund (months of expenses covered)
    if (monthlyNet > 0) {
      const monthsCovered = emergencyFund / monthlyNet;
  
      if (monthsCovered < 1) {
        recs.push(
          `Your emergency fund covers less than 1 month of expenses. Aim to build at least 3 months of basic living costs in cash or very liquid accounts.`
        );
      } else if (monthsCovered < 3) {
        recs.push(
          `Your emergency fund covers about ${monthsCovered.toFixed(
            1
          )} month(s). Gradually increase this to at least 3–6 months to handle surprises without relying on debt.`
        );
      } else {
        recs.push(
          `Your emergency fund looks solid at roughly ${monthsCovered.toFixed(
            1
          )} month(s) of expenses. You can start prioritizing higher-interest debt payoff or long-term investing.`
        );
      }
    }
  
    // 2) Savings rate vs income
    if (monthlyNet > 0) {
      if (savingsRate < 0.1) {
        recs.push(
          `You’re saving less than 10% of your take-home income. Try to gradually move toward saving 15–20% by trimming small recurring expenses or increasing your income.`
        );
      } else if (savingsRate < 0.2) {
        recs.push(
          `You’re saving around ${(savingsRate * 100).toFixed(
            1
          )}% of your take-home income. That’s a good start — see if you can push this closer to 20% over time.`
        );
      } else {
        recs.push(
          `You’re saving roughly ${(savingsRate * 100).toFixed(
            1
          )}% of your take-home income. That’s strong — consider directing extra savings into long-term investments or specific goals (house, retirement, education).`
        );
      }
    }
  
    // 3) 50/30/20 rule analysis
    if (monthlyNet > 0 && totalCurrentMonthSpending > 0) {
      const needsOk = needsPercentOfIncome <= 55;
      const wantsOk = wantsPercentOfIncome <= 35;
      const savingsOk = savingsPercentOfIncome >= 15;
  
      if (!needsOk) {
        recs.push(
          `Your “needs” (fixed bills) are taking about ${needsPercentOfIncome.toFixed(
            1
          )}% of your income. See if you can renegotiate large bills (rent, insurance, subscriptions) or reduce fixed commitments over time.`
        );
      }
      if (!wantsOk) {
        recs.push(
          `Your “wants” (variable / lifestyle spending) are around ${wantsPercentOfIncome.toFixed(
            1
          )}% of income. Track categories like dining out, entertainment, and shopping — even a 5–10% reduction can free up meaningful savings.`
        );
      }
      if (!savingsOk) {
        recs.push(
          `Your savings rate is about ${savingsPercentOfIncome.toFixed(
            1
          )}% of income. Aim to get closer to 20% over time by shifting a bit from wants into automatic savings or investments.`
        );
      }
      if (needsOk && wantsOk && savingsOk) {
        recs.push(
          `Your spending mix is roughly aligned with the 50/30/20 guideline (needs/wants/savings). Keep monitoring each month so this balance stays intentional.`
        );
      }
    }
  
    // 4) Debt vs assets & net worth
    if (totalDebts > 0) {
      const debtToAssets = totalAssets > 0 ? totalDebts / totalAssets : Infinity;
  
      if (debtToAssets === Infinity || debtToAssets > 1.2) {
        recs.push(
          `Your total debts are high relative to your assets. Focus on a debt payoff plan, starting with high-interest debts (especially credit cards) while maintaining a small emergency buffer.`
        );
      } else if (debtToAssets > 0.5) {
        recs.push(
          `Your debt-to-asset ratio is moderate. Consider making slightly larger payments on high-interest debts to reduce interest costs while still contributing to savings and investments.`
        );
      } else {
        recs.push(
          `Your debts look manageable relative to your assets. Keep payments consistent and avoid adding new high-interest debt.`
        );
      }
  
      if (netWorth < 0) {
        recs.push(
          `Your net worth is currently negative, which is common early on. The key levers are: paying down high-interest debt, building an emergency fund, and steadily growing investments.`
        );
      }
    } else if (totalAssets > 0) {
      recs.push(
        `You have assets but little or no debt, which is a strong position. Focus on aligning your investments with your risk tolerance and long-term goals.`
      );
    }
  
    // 5) Retirement goal vs projection
    if (retirementTargetAmount > 0 && retirementYearsFromNow > 0) {
      const coverage =
        retirementTargetAmount > 0
          ? projectedRetirementFV / retirementTargetAmount
          : 0;
  
      if (coverage < 0.6) {
        recs.push(
          `At your current monthly savings and expected return, you may reach about ${(coverage *
            100).toFixed(
            0
          )}% of your retirement target. Consider increasing monthly retirement contributions or extending your time horizon.`
        );
      } else if (coverage < 1) {
        recs.push(
          `You’re on track for roughly ${(coverage * 100).toFixed(
            0
          )}% of your retirement goal. Small increases in contributions or slightly higher returns could close the gap.`
        );
      } else {
        recs.push(
          `Your current savings plan could fully cover (or exceed) your retirement target, assuming returns stay near your expected rate. Periodically review your assumptions and risk level.`
        );
      }
    }
  
    // 6) House goal
    if (houseGoalAmount > 0 && houseGoalYears > 0) {
      const coverage =
        houseGoalAmount > 0 ? projectedHouseFV / houseGoalAmount : 0;
  
      if (coverage < 0.6) {
        recs.push(
          `Your house-down-payment goal may be underfunded at the current monthly amount. Consider increasing contributions or adjusting the target price/timeline.`
        );
      } else if (coverage < 1) {
        recs.push(
          `You’re on a reasonable path toward your house goal, but there’s a small gap. A modest boost in monthly investing or a slightly longer timeline could close it.`
        );
      } else {
        recs.push(
          `You’re on track (or ahead) for your house goal based on your current plan. Make sure this money is kept in an appropriate mix of safe vs growth assets given your timeline.`
        );
      }
    }
  
    // 7) Education goal
    if (educationGoalAmount > 0 && educationGoalYears > 0) {
      const coverage =
        educationGoalAmount > 0 ? projectedEducationFV / educationGoalAmount : 0;
  
      if (coverage < 0.6) {
        recs.push(
          `Your education goal is currently underfunded. Consider increasing monthly contributions or exploring scholarships/alternative funding to reduce the future burden.`
        );
      } else if (coverage < 1) {
        recs.push(
          `You’re part-way to your education goal. A slight increase in monthly investing or a longer horizon could help fully fund it.`
        );
      } else {
        recs.push(
          `You appear to be on track (or ahead) for your education goal. Continue monitoring contributions as tuition expectations change over time.`
        );
      }
    }
  
    // 8) Fallback if somehow nothing fired
    if (recs.length === 0) {
      recs.push(
        "Your numbers look fairly balanced. Keep tracking them monthly so you can spot trends early and adjust savings, debt payoff, and investing as your goals evolve."
      );
    }
  
    return recs;
  }, [
    monthlyNet,
    monthlySavings,
    savingsRate,
    emergencyFund,
    recommendedEmergencyFund,
    totalDebts,
    totalAssets,
    netWorth,
    totalCurrentMonthSpending,
    needsPercentOfIncome,
    wantsPercentOfIncome,
    savingsPercentOfIncome,
    retirementTargetAmount,
    retirementYearsFromNow,
    projectedRetirementFV,
    expectedAnnualReturnRate,
    houseGoalAmount,
    houseGoalYears,
    projectedHouseFV,
    educationGoalAmount,
    educationGoalYears,
    projectedEducationFV,
  ]);  

  // ------------------ JSX ------------------
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-header">
          <div className="page-header-main">
            <h1>Personal Budget & Expense Tracker</h1>
            <p>
              Log your expenses like a sheet, track debts and assets, set goals,
              and see personalized tips to improve your savings.
            </p>
          </div>
        </header>

        {/* 1. KPI Bar */}
        <TopSummaryBar
          netWorth={netWorth}
          savingsRate={savingsRate}
          monthlyNet={monthlyNet}
          needsPercentOfIncome={needsPercentOfIncome}
          wantsPercentOfIncome={wantsPercentOfIncome}
          savingsPercentOfIncome={savingsPercentOfIncome}
          fiftyStatus={fiftyStatus}
          fiftyStatusClass={fiftyStatusClass}
        />

        {/* 2. Expenses */}
        <ExpensesSection
          expenseCategories={expenseCategories}
          category={category}
          setCategory={setCategory}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          notes={notes}
          setNotes={setNotes}
          loadingExpenses={loadingExpenses}
          expensesSorted={expensesSorted}
          totalExpenses={totalExpenses}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />

        {/* 3. Goals & Income */}
        <GoalsIncomeSection
          goals={goals}
          income={income}
          handleGoalsChange={handleGoalsChange}
          handleIncomeChange={handleIncomeChange}
          monthlyNet={monthlyNet}
          savingsRate={savingsRate}
          projectedMonthlySavings={projectedMonthlySavings}
          retirementTargetAmount={retirementTargetAmount}
          retirementYearsFromNow={retirementYearsFromNow}
          expectedAnnualReturnRate={expectedAnnualReturnRate}
          requiredMonthlyRetirement={requiredMonthlyRetirement}
        />

        {/* 4. Investments */}
        <InvestmentsSection
          investing={investing}
          handleInvestingChange={handleInvestingChange}
          expectedAnnualReturnRate={expectedAnnualReturnRate}
          monthlySavings={monthlySavings}
          projectedRetirementFV={projectedRetirementFV}
          houseGoalAmount={houseGoalAmount}
          houseGoalYears={houseGoalYears}
          requiredMonthlyHouse={requiredMonthlyHouse}
          projectedHouseFV={projectedHouseFV}
          educationGoalAmount={educationGoalAmount}
          educationGoalYears={educationGoalYears}
          requiredMonthlyEducation={requiredMonthlyEducation}
          projectedEducationFV={projectedEducationFV}
          monthlyInvestForGoals={monthlyInvestForGoals}
        />

        {/* 5. Debts & Assets */}
        <DebtsAssetsSection
          debts={debts}
          assets={assets}
          handleDebtChange={handleDebtChange}
          handleAssetChange={handleAssetChange}
          totalDebts={totalDebts}
          totalAssets={totalAssets}
          netWorth={netWorth}
          fixedSpending={fixedSpending}
          variableSpending={variableSpending}
          totalCurrentMonthSpending={totalCurrentMonthSpending}
        />

        {/* 6. Recommendations */}
        <RecommendationsSection recommendations={recommendations} />
      </div>
    </main>
  );
}