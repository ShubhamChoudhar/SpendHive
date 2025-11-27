"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebaseClient";

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
  "Miscellaneous"
];

// categories we treat as “fixed / needs”
const fixedCategories = new Set([
  "Rent",
  "Electricity Bill",
  "Water Bill",
  "Internet",
  "Cable / Streaming Services",
  "Cell Phone Bill",
  "Car Payments",
  "Home Loan EMI",
  "Insurance (Health / Auto / Home)"
]);

// ---------- helper functions for compounding maths ----------
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
  if (!annualRate) {
    return amount / months;
  }
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
  if (!annualRate) {
    return m * months;
  }
  const r = annualRate / 12;
  const factor = Math.pow(1 + r, months);
  return m * ((factor - 1) / r);
}

export default function Home() {
  const router = useRouter();

  // ------------------ Auth state (for hello + logout) ------------------
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [expenses, setExpenses] = useState<
    { id: number; category: string; amount: number; date: string; notes: string }[]
  >([]);
  const [debts, setDebts] = useState({
    mortgage: "",
    carLoan: "",
    creditCards: "",
    personalLoan: "",
    studentLoan: "",
    otherDebt: "",
    numberOfCreditCards: "",
    highestCardAPR: "",
    avgDebtAPR: ""
  });

  const [assets, setAssets] = useState({
    cash: "",
    savingsAccount: "",
    checkingAccount: "",
    hsa: "",
    investments: "",
    retirement: "",
    property: "",
    otherAssets: ""
  });

  const [goals, setGoals] = useState({
    shortTerm: "",
    longTerm: "",
    vacation: "",
    holidays: "",
    retirementTargetAmount: "",
    retirementYearsFromNow: ""
  });

  const [income, setIncome] = useState({
    monthlyGross: "",
    monthlyNet: "",
    currentMonthlySavings: "",
    savingsIncreasePercent: "",
    savingsIncreaseYears: ""
  });

  const [investing, setInvesting] = useState({
    currentHoldings: "",
    riskTolerance: "",
    expectedAnnualReturn: "",
    monthlyInvestForGoals: "",
    houseGoalAmount: "",
    houseGoalYears: "",
    educationGoalAmount: "",
    educationGoalYears: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async user => {
      setAuthUser(user || null);
      setAuthLoading(false);

      // optional: refresh session cookie on client navigation
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
          });
        } catch (err) {
          console.error("Failed to refresh session cookie", err);
        }
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    // Wait until we know the auth state
    if (authLoading) return;
  
    // Not logged in – don’t load anything here
    if (!authUser) {
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

  useEffect(() => {
    if (!authUser) return;
    if (loadingData) return; // don’t overwrite data while initial load is happening
  
    // Debounce saves so we don't write on every keystroke immediately
    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        setSaveStatus("Saving…");
  
        const ref = doc(firebaseDb, "users", authUser.uid, "profile", "main");
        await setDoc(
          ref,
          {
            expenses,
            debts,
            assets,
            goals,
            income,
            investing,
            updatedAt: serverTimestamp()
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
    }, 1000); // 1 second debounce
  
    return () => clearTimeout(timeout);
  }, [
    authUser,
    loadingData,
    expenses,
    debts,
    assets,
    goals,
    income,
    investing
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

  // ------------------ Expenses ------------------
  // const [category, setCategory] = useState(expenseCategories[0]);
  // const [amount, setAmount] = useState("");
  // const [date, setDate] = useState("");
  // const [notes, setNotes] = useState("");
  // const [expenses, setExpenses] = useState<
  //   { id: number; category: string; amount: number; date: string; notes: string }[]
  // >([]);

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

  // current-month expenses
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter(exp => {
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
    currentMonthExpenses.forEach(exp => {
      if (fixedCategories.has(exp.category)) {
        fixed += Number(exp.amount) || 0;
      } else {
        variable += Number(exp.amount) || 0;
      }
    });
    return { fixedSpending: fixed, variableSpending: variable };
  }, [currentMonthExpenses]);

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();

    if (!category) {
      alert("Please select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!date) {
      alert("Please select a date");
      return;
    }

    const newExpense = {
      id: Date.now(),
      category,
      amount: Number(amount),
      date,
      notes: notes.trim()
    };

    setExpenses(prev => [...prev, newExpense]);
    setAmount("");
    setDate("");
    setNotes("");
  }

  function handleDeleteExpense(id: number) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  // ------------------ Debts & Assets ------------------
  // const [debts, setDebts] = useState({
  //   mortgage: "",
  //   carLoan: "",
  //   creditCards: "",
  //   personalLoan: "",
  //   studentLoan: "",
  //   otherDebt: "",
  //   numberOfCreditCards: "",
  //   highestCardAPR: "",
  //   avgDebtAPR: ""
  // });

  // const [assets, setAssets] = useState({
  //   cash: "",
  //   savingsAccount: "",
  //   checkingAccount: "",
  //   hsa: "",
  //   investments: "",
  //   retirement: "",
  //   property: "",
  //   otherAssets: ""
  // });

  const totalDebts = useMemo(
    () =>
      ["mortgage", "carLoan", "creditCards", "personalLoan", "studentLoan", "otherDebt"].reduce(
        (sum, key) => sum + (Number((debts as any)[key]) || 0),
        0
      ),
    [debts]
  );

  const totalAssets = useMemo(
    () => Object.values(assets).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [assets]
  );

  const netWorth = totalAssets - totalDebts;

  function handleDebtChange(field: keyof typeof debts, value: string) {
    setDebts(prev => ({ ...prev, [field]: value }));
  }

  function handleAssetChange(field: keyof typeof assets, value: string) {
    setAssets(prev => ({ ...prev, [field]: value }));
  }

  // ------------------ Goals & Income ------------------
  // const [goals, setGoals] = useState({
  //   shortTerm: "",
  //   longTerm: "",
  //   vacation: "",
  //   holidays: "",
  //   retirementTargetAmount: "",
  //   retirementYearsFromNow: ""
  // });

  // const [income, setIncome] = useState({
  //   monthlyGross: "",
  //   monthlyNet: "",
  //   currentMonthlySavings: "",
  //   savingsIncreasePercent: "",
  //   savingsIncreaseYears: ""
  // });

  function handleGoalsChange(field: keyof typeof goals, value: string) {
    setGoals(prev => ({ ...prev, [field]: value }));
  }

  function handleIncomeChange(field: keyof typeof income, value: string) {
    setIncome(prev => ({ ...prev, [field]: value }));
  }

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

  // ------------------ Investing profile & goals ------------------
  // const [investing, setInvesting] = useState({
  //   currentHoldings: "",
  //   riskTolerance: "",
  //   expectedAnnualReturn: "",
  //   monthlyInvestForGoals: "",
  //   houseGoalAmount: "",
  //   houseGoalYears: "",
  //   educationGoalAmount: "",
  //   educationGoalYears: ""
  // });

  function handleInvestingChange(field: keyof typeof investing, value: string) {
    setInvesting(prev => ({ ...prev, [field]: value }));
  }

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

  // ------------------ 50/30/20 guideline ------------------
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

  // ------------------ Recommendations (same as before) ------------------
  const recommendations = useMemo(() => {
    const recs: string[] = [];

    // savings rate
    if (monthlyNet > 0) {
      if (monthlySavings === 0) {
        recs.push(
          "You are not saving anything from your in-hand income yet. Try starting with even 5% as an automatic transfer into savings or investments."
        );
      } else if (savingsRate < 0.1) {
        recs.push(
          `Your savings rate is about ${(savingsRate * 100).toFixed(
            1
          )}%. Aim for at least 10–20% of your in-hand income going into savings or investments.`
        );
      } else if (savingsRate >= 0.1 && savingsRate < 0.2) {
        recs.push(
          `Nice! Your savings rate is around ${(savingsRate * 100).toFixed(
            1
          )}%. See if you can gradually push this closer to 20% over time.`
        );
      } else {
        recs.push(
          `Great job — your savings rate is roughly ${(savingsRate * 100).toFixed(
            1
          )}%. Keep this habit and review your investments yearly.`
        );
      }
    }

    // emergency fund
    if (monthlyNet > 0) {
      if (emergencyFund <= 0) {
        recs.push(
          "You don't appear to have a liquid emergency fund yet. Try to build at least 3 months of basic expenses in cash / savings as a first priority."
        );
      } else if (emergencyFund < recommendedEmergencyFund) {
        recs.push(
          `Your liquid emergency fund is about $${emergencyFund.toFixed(
            2
          )}. A common rule of thumb is at least 3 months of in-hand income (~$${recommendedEmergencyFund.toFixed(
            2
          )}). Consider prioritizing this before taking on new long-term investments.`
        );
      } else {
        recs.push(
          `Your emergency fund (~$${emergencyFund.toFixed(
            2
          )}) looks solid relative to your monthly income. You can direct more of new savings toward investments or debt payoff.`
        );
      }
    }

    // debts
    if (totalDebts > 0) {
      if (totalDebts > totalAssets) {
        recs.push(
          "Your total debts are higher than your assets. Focus on reducing high-interest debts first (especially credit cards and personal loans) before taking on new big expenses."
        );
      } else {
        recs.push(
          "Your assets are higher than your debts, which is a good sign. Keep tracking your loans and try to prepay high-interest ones when you have extra cash."
        );
      }

      const numCards = Number(debts.numberOfCreditCards) || 0;
      const highestAPR = Number(debts.highestCardAPR) || 0;
      const avgAPR = Number(debts.avgDebtAPR) || 0;

      if (numCards > 0) {
        recs.push(
          `You reported about ${numCards} credit card(s). With credit cards, it's usually best to avoid carrying balances month-to-month and aim to pay them in full.`
        );
      }
      if (highestAPR > 0 || avgAPR > 0) {
        const focusRate = highestAPR || avgAPR;
        recs.push(
          `Consider using a “debt avalanche” strategy: pay at least the minimum on all debts and direct every extra dollar toward the debt with the highest interest rate (around ${focusRate}% for you). This minimizes total interest paid.`
        );
        recs.push(
          "If you need more motivation, a “debt snowball” approach (tackling the smallest balances first) can help you see quick wins, even if it’s not mathematically perfect."
        );
      }
    }

    // retirement goal
    if (retirementTargetAmount > 0 && retirementYearsFromNow > 0) {
      if (requiredMonthlyRetirement > 0 && monthlySavings > 0) {
        if (monthlySavings < requiredMonthlyRetirement) {
          recs.push(
            `To reach your retirement goal of $${retirementTargetAmount.toLocaleString()} in ${retirementYearsFromNow} years with an assumed return of ${expectedAnnualReturnRate ||
              0}% per year, you’d need to invest about $${requiredMonthlyRetirement.toFixed(
              2
            )} per month. Right now you’re investing about $${monthlySavings.toFixed(
              2
            )}, so look for ways to narrow this gap over time.`
          );
        } else {
          recs.push(
            `Based on your assumption of ${expectedAnnualReturnRate ||
              0}% per year, your current monthly investing (~$${monthlySavings.toFixed(
              2
            )}) is in the range needed to hit your retirement goal of $${retirementTargetAmount.toLocaleString()} in ${retirementYearsFromNow} years (in a simple projection).`
          );
        }

        if (projectedRetirementFV > 0) {
          recs.push(
            `If you keep investing about $${monthlySavings.toFixed(
              2
            )} per month with an assumed ${expectedAnnualReturnRate ||
              0}% annual return, a rough projection suggests you could reach about $${projectedRetirementFV.toFixed(
              0
            )} by retirement (this is not guaranteed and markets are unpredictable).`
          );
        }
      }
    }

    // house + education goals
    if (houseGoalAmount > 0 && houseGoalYears > 0) {
      if (requiredMonthlyHouse > 0 && monthlyInvestForGoals > 0) {
        if (monthlyInvestForGoals < requiredMonthlyHouse) {
          recs.push(
            `For your house goal of $${houseGoalAmount.toLocaleString()} in ${houseGoalYears} years at ~${expectedAnnualReturnRate ||
              0}% assumed return, you'd need around $${requiredMonthlyHouse.toFixed(
              2
            )} per month. You're currently investing about $${monthlyInvestForGoals.toFixed(
              2
            )} toward long-term goals, so try to bridge that gap where possible.`
          );
        } else {
          recs.push(
            `Your planned monthly investing (~$${monthlyInvestForGoals.toFixed(
              2
            )}) looks in line with your house goal of $${houseGoalAmount.toLocaleString()} in ${houseGoalYears} years (under a simple ${expectedAnnualReturnRate ||
              0}% assumption).`
          );
        }

        if (projectedHouseFV > 0) {
          recs.push(
            `If you keep investing $${monthlyInvestForGoals.toFixed(
              2
            )} monthly with an assumed ${expectedAnnualReturnRate ||
              0}% annual return, you might reach around $${projectedHouseFV.toFixed(
              0
            )} toward your house goal (again, this is only a rough projection).`
          );
        }
      }
    }

    if (educationGoalAmount > 0 && educationGoalYears > 0) {
      if (requiredMonthlyEducation > 0 && monthlyInvestForGoals > 0) {
        if (monthlyInvestForGoals < requiredMonthlyEducation) {
          recs.push(
            `For your education goal of $${educationGoalAmount.toLocaleString()} in ${educationGoalYears} years, a simple projection suggests you'd need around $${requiredMonthlyEducation.toFixed(
              2
            )} per month.`
          );
        } else {
          recs.push(
            `Your current planned investing could be enough to cover your education goal of $${educationGoalAmount.toLocaleString()} in ${educationGoalYears} years, under your assumed return rate.`
          );
        }

        if (projectedEducationFV > 0) {
          recs.push(
            `Sticking to your current monthly investing plan could grow to about $${projectedEducationFV.toFixed(
              0
            )} toward your education goal (assuming ${expectedAnnualReturnRate ||
              0}% annual returns, which are not guaranteed).`
          );
        }
      }
    }

    // 50/30/20 rule
    if (monthlyNet > 0 && totalCurrentMonthSpending > 0) {
      recs.push(
        `This month, your tracked fixed/essential spending is about $${fixedSpending.toFixed(
          2
        )} and other/day-to-day spending is about $${variableSpending.toFixed(2)}.`
      );
      if (fixedSpending > needsMax) {
        recs.push(
          `Your fixed costs look higher than the common 50% rule of thumb for needs (around $${needsMax.toFixed(
            2
          )} based on your in-hand income). Review rent, utilities, subscriptions, and insurance to see if anything can be renegotiated or optimized.`
        );
      }
      if (variableSpending > wantsMax) {
        recs.push(
          `Your variable/wants spending may be above the typical 30% guideline (~$${wantsMax.toFixed(
            2
          )}). Consider setting weekly limits for dining out, entertainment, and impulse buys.`
        );
      }
      if (monthlySavings < savingsMin) {
        recs.push(
          `You're saving less than the commonly suggested 20% of in-hand income (~$${savingsMin.toFixed(
            2
          )}). As your income grows, try to direct part of each raise straight into savings or investments.`
        );
      }
    }

    // risk tolerance
    if (investing.riskTolerance) {
      if (investing.riskTolerance === "Conservative") {
        recs.push(
          "You marked your risk tolerance as conservative. Typically that aligns more with a mix of cash, high-quality bonds, and large-cap or index equity funds. Focus on diversification, low fees, and capital preservation rather than chasing high returns."
        );
      } else if (investing.riskTolerance === "Moderate") {
        recs.push(
          "With a moderate risk tolerance, a balanced portfolio (for example, a blend of broad equity index funds and bond funds) can make sense. Avoid concentrating too much in a single stock or sector."
        );
      } else if (investing.riskTolerance === "Aggressive") {
        recs.push(
          "An aggressive profile usually means higher exposure to equities and growth-oriented funds. It's still important to diversify across regions and sectors and make sure you can emotionally handle big swings in value."
        );
      }
      recs.push(
        "For specific stocks, ETFs, or mutual funds, look for low-cost, diversified index products that fit your risk level and investment horizon, and consider speaking with a qualified financial advisor before making decisions."
      );
    }

    // vacation / holidays
    if (goals.vacation || goals.holidays) {
      recs.push(
        "Since you have vacation/holiday goals, create a separate “travel” or “festivals” sinking fund and put a fixed amount into it every month so big trips don’t disrupt your regular budget."
      );
    }

    if (!recs.length) {
      recs.push(
        "Fill in your income, savings, debts, assets, and goals to see tailored budgeting suggestions here. This is not financial advice, just simple guidance based on your numbers."
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
    debts,
    retirementTargetAmount,
    retirementYearsFromNow,
    expectedAnnualReturnRate,
    requiredMonthlyRetirement,
    projectedRetirementFV,
    houseGoalAmount,
    houseGoalYears,
    requiredMonthlyHouse,
    projectedHouseFV,
    educationGoalAmount,
    educationGoalYears,
    requiredMonthlyEducation,
    projectedEducationFV,
    monthlyInvestForGoals,
    totalCurrentMonthSpending,
    fixedSpending,
    variableSpending,
    needsMax,
    wantsMax,
    savingsMin,
    investing.riskTolerance,
    goals.vacation,
    goals.holidays
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

          <div className="page-header-user">
            {authLoading ? (
              <span className="user-pill">Checking session…</span>
            ) : authUser ? (
              <>
                <span className="user-pill">
                  Hello, {authUser.displayName || authUser.email}
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <a href="/login" className="logout-btn">
                Log in
              </a>
            )}

            {/* {authUser && (
                <span className="save-status">
                  {saving ? "Saving…" : saveStatus || ""}
                </span>
            )} */}
          </div>
        </header>

        {/* Top KPI Summary */}
        <section className="top-summary-bar card">
          <div className="kpi-item">
            <span className="kpi-label">Net Worth</span>
            <span className={`kpi-value ${netWorth >= 0 ? "positive" : "negative"}`}>
              ${netWorth.toFixed(2)}
            </span>
          </div>

          <div className="kpi-item">
            <span className="kpi-label">Savings Rate</span>
            <span className="kpi-value">{(savingsRate * 100 || 0).toFixed(1)}%</span>
            {monthlyNet > 0 && (
              <span className="kpi-sub">
                Needs: {needsPercentOfIncome.toFixed(1)}% · Wants:{" "}
                {wantsPercentOfIncome.toFixed(1)}% · Saving:{" "}
                {savingsPercentOfIncome.toFixed(1)}%
              </span>
            )}
          </div>

          <div className="kpi-item">
            <span className="kpi-label">50/30/20 Status</span>
            <span className={`kpi-badge ${fiftyStatusClass}`}>{fiftyStatus}</span>
            {monthlyNet > 0 && (
              <span className="kpi-sub">
                Target ≈ 50% needs · 30% wants · 20% saving
              </span>
            )}
          </div>
        </section>

        {/* EXPENSE ENTRY + SHEET */}
         <section className="card">
            <h2>Expenses Sheet</h2>

           <form className="expense-form" onSubmit={handleAddExpense}>
             <div className="expense-form-grid">
               <label htmlFor="category">Category:</label>
               <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />

              <label htmlFor="date">Date:</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />

              <label htmlFor="notes">Description / Notes:</label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Dinner with friends, Netflix subscription, gas refill..."
              />
            </div>

            <div className="expense-form-actions">
              <button type="submit">Add Expense</button>
            </div>
          </form>

          <div className="table-wrapper">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Description / Notes</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {loadingExpenses ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Loading expenses…
                    </td>
                  </tr>
                ) : expensesSorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No expenses yet. Add your first one above.
                    </td>
                  </tr>
                ) : (
                  expensesSorted.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.category}</td>
                      <td>${exp.amount.toFixed(2)}</td>
                      <td>{exp.date}</td>
                      <td>{exp.notes || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="total-label">Total:</td>
                  <td className="total-value">
                    ${totalExpenses.toFixed(2)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* GOALS & INCOME */}
        <section className="card goals-income-card">
          <h2>Goals & Income</h2>
          <div className="goals-income-grid">
            <div>
              <h3>Goals</h3>
              <label>Short-term goals (1–2 years)</label>
              <textarea
                rows={2}
                value={goals.shortTerm}
                onChange={e =>
                  handleGoalsChange("shortTerm", e.target.value)
                }
                placeholder="e.g. Build $25,000 emergency fund, pay off one credit card..."
              />

              <label>Long-term goals (5+ years)</label>
              <textarea
                rows={2}
                value={goals.longTerm}
                onChange={e =>
                  handleGoalsChange("longTerm", e.target.value)
                }
                placeholder="e.g. Buy a house, kids’ education, financial independence..."
              />

              <label>Vacation / Travel goals</label>
              <textarea
                rows={2}
                value={goals.vacation}
                onChange={e =>
                  handleGoalsChange("vacation", e.target.value)
                }
                placeholder="Where do you want to go and roughly how much will it cost?"
              />

              <label>Festivals / Holidays spending</label>
              <textarea
                rows={2}
                value={goals.holidays}
                onChange={e =>
                  handleGoalsChange("holidays", e.target.value)
                }
                placeholder="e.g. Diwali/Christmas gifts budget, family visits, etc."
              />

              <label>Retirement target amount</label>
              <input
                type="number"
                min="0"
                value={goals.retirementTargetAmount}
                onChange={e =>
                  handleGoalsChange(
                    "retirementTargetAmount",
                    e.target.value
                  )
                }
                placeholder="How much do you want to have at retirement?"
              />

              <label>Years until retirement</label>
              <input
                type="number"
                min="0"
                value={goals.retirementYearsFromNow}
                onChange={e =>
                  handleGoalsChange(
                    "retirementYearsFromNow",
                    e.target.value
                  )
                }
                placeholder="e.g. 30"
              />
            </div>

            <div>
              <h3>Income & Savings</h3>
              <label>Monthly income (before tax)</label>
              <input
                type="number"
                min="0"
                value={income.monthlyGross}
                onChange={e =>
                  handleIncomeChange("monthlyGross", e.target.value)
                }
                placeholder="Total monthly salary / income"
              />

              <label>Monthly in-hand income (after tax)</label>
              <input
                type="number"
                min="0"
                value={income.monthlyNet}
                onChange={e =>
                  handleIncomeChange("monthlyNet", e.target.value)
                }
                placeholder="What actually hits your bank account"
              />

              <label>Current monthly savings / investments</label>
              <input
                type="number"
                min="0"
                value={income.currentMonthlySavings}
                onChange={e =>
                  handleIncomeChange(
                    "currentMonthlySavings",
                    e.target.value
                  )
                }
                placeholder="Total per month going into savings, SIPs, etc."
              />

              <label>
                Plan to increase savings by (%) every few years
              </label>
              <input
                type="number"
                min="0"
                value={income.savingsIncreasePercent}
                onChange={e =>
                  handleIncomeChange(
                    "savingsIncreasePercent",
                    e.target.value
                  )
                }
                placeholder="e.g. 2 or 3"
              />

              <label>Every how many years?</label>
              <input
                type="number"
                min="0"
                value={income.savingsIncreaseYears}
                onChange={e =>
                  handleIncomeChange(
                    "savingsIncreaseYears",
                    e.target.value
                  )
                }
                placeholder="e.g. 1 or 5"
              />

              {monthlyNet > 0 && (
                <div className="goals-income-summary">
                  <p>
                    Current savings rate:{" "}
                    <strong>
                      {(savingsRate * 100 || 0).toFixed(1)}%
                    </strong>{" "}
                    of in-hand income.
                  </p>
                  {projectedMonthlySavings > monthlySavings && (
                    <p>
                      Projected monthly savings after step-up:{" "}
                      <strong>
                        ${projectedMonthlySavings.toFixed(2)}
                      </strong>
                      .
                    </p>
                  )}
                  {retirementTargetAmount > 0 &&
                    retirementYearsFromNow > 0 &&
                    expectedAnnualReturnRate >= 0 && (
                      <p>
                        Rough monthly saving needed for retirement
                        goal (with your assumed{" "}
                        {expectedAnnualReturnRate || 0}
                        % return):{" "}
                        <strong>
                          ${requiredMonthlyRetirement.toFixed(2)}
                        </strong>
                        .
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INVESTMENTS & RISK PROFILE */}
        <section className="card goals-income-card">
          <h2>Investments & Risk Profile</h2>
          <div className="goals-income-grid">
            <div>
              <h3>Current Portfolio</h3>
              <label>Stocks / ETFs / Mutual Funds</label>
              <textarea
                rows={4}
                value={investing.currentHoldings}
                onChange={e =>
                  handleInvestingChange(
                    "currentHoldings",
                    e.target.value
                  )
                }
                placeholder="List your main holdings, e.g. S&P 500 index fund, international equity fund, bond fund, etc."
              />

              <label>Monthly amount invested for long-term goals</label>
              <input
                type="number"
                min="0"
                value={investing.monthlyInvestForGoals}
                onChange={e =>
                  handleInvestingChange(
                    "monthlyInvestForGoals",
                    e.target.value
                  )
                }
                placeholder="How much you invest monthly toward house, kids, etc."
              />

              <label>Expected long-term annual return (%)</label>
              <input
                type="number"
                min="0"
                value={investing.expectedAnnualReturn}
                onChange={e =>
                  handleInvestingChange(
                    "expectedAnnualReturn",
                    e.target.value
                  )
                }
                placeholder="e.g. 6–8 (just a planning assumption)"
              />
            </div>

            <div>
              <h3>Goals & Risk</h3>
              <label>House fund target & years</label>
              <div className="inline-inputs">
                <input
                  type="number"
                  min="0"
                  value={investing.houseGoalAmount}
                  onChange={e =>
                    handleInvestingChange(
                      "houseGoalAmount",
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                />
                <input
                  type="number"
                  min="0"
                  value={investing.houseGoalYears}
                  onChange={e =>
                    handleInvestingChange(
                      "houseGoalYears",
                      e.target.value
                    )
                  }
                  placeholder="Years"
                />
              </div>

              <label>Education fund target & years</label>
              <div className="inline-inputs">
                <input
                  type="number"
                  min="0"
                  value={investing.educationGoalAmount}
                  onChange={e =>
                    handleInvestingChange(
                      "educationGoalAmount",
                      e.target.value
                    )
                  }
                  placeholder="Amount"
                />
                <input
                  type="number"
                  min="0"
                  value={investing.educationGoalYears}
                  onChange={e =>
                    handleInvestingChange(
                      "educationGoalYears",
                      e.target.value
                    )
                  }
                  placeholder="Years"
                />
              </div>

              <label>Risk tolerance</label>
              <select
                value={investing.riskTolerance}
                onChange={e =>
                  handleInvestingChange(
                    "riskTolerance",
                    e.target.value
                  )
                }
              >
                <option value="">Select</option>
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>

              {expectedAnnualReturnRate > 0 &&
                retirementTargetAmount > 0 &&
                retirementYearsFromNow > 0 &&
                monthlySavings > 0 && (
                  <div className="goals-income-summary">
                    <p>
                      With your current monthly investing of{" "}
                      <strong>${monthlySavings.toFixed(2)}</strong>{" "}
                      and an assumed{" "}
                      <strong>
                        {expectedAnnualReturnRate.toFixed(1)}%
                      </strong>{" "}
                      annual return, a rough projection at retirement
                      is:{" "}
                      <strong>
                        $
                        {projectedRetirementFV.toFixed(0)}
                      </strong>{" "}
                      (not guaranteed).
                    </p>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* DEBTS & ASSETS */}
        <section className="summary-grid">
          <div className="card">
            <h2>Debts & Liabilities</h2>
            <table className="sheet-table mini">
              <tbody>
                <tr>
                  <td>Mortgage / Home Loan</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.mortgage}
                      onChange={e =>
                        handleDebtChange("mortgage", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Car Loan</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.carLoan}
                      onChange={e =>
                        handleDebtChange("carLoan", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Credit Card Debt (total)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.creditCards}
                      onChange={e =>
                        handleDebtChange(
                          "creditCards",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Personal Loan</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.personalLoan}
                      onChange={e =>
                        handleDebtChange(
                          "personalLoan",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Student Loan</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.studentLoan}
                      onChange={e =>
                        handleDebtChange(
                          "studentLoan",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Other Debt</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.otherDebt}
                      onChange={e =>
                        handleDebtChange("otherDebt", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td># of credit cards</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.numberOfCreditCards}
                      onChange={e =>
                        handleDebtChange(
                          "numberOfCreditCards",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Highest card APR (%)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.highestCardAPR}
                      onChange={e =>
                        handleDebtChange(
                          "highestCardAPR",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Average interest rate on debts (%)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={debts.avgDebtAPR}
                      onChange={e =>
                        handleDebtChange("avgDebtAPR", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="total-label">Total Debts</td>
                  <td className="total-value">
                    ${totalDebts.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>Assets & Savings</h2>
            <table className="sheet-table mini">
              <tbody>
                <tr>
                  <td>Cash in Hand</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.cash}
                      onChange={e =>
                        handleAssetChange("cash", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Savings Account</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.savingsAccount}
                      onChange={e =>
                        handleAssetChange(
                          "savingsAccount",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Checking Account</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.checkingAccount}
                      onChange={e =>
                        handleAssetChange(
                          "checkingAccount",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>HSA (Health Savings Account)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.hsa}
                      onChange={e =>
                        handleAssetChange("hsa", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Investments (Stocks / MF / Crypto)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.investments}
                      onChange={e =>
                        handleAssetChange(
                          "investments",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Retirement Accounts (401k, IRA, etc.)</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.retirement}
                      onChange={e =>
                        handleAssetChange(
                          "retirement",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Property / Real Estate Value</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.property}
                      onChange={e =>
                        handleAssetChange(
                          "property",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>Other Assets</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={assets.otherAssets}
                      onChange={e =>
                        handleAssetChange(
                          "otherAssets",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td className="total-label">Total Assets</td>
                  <td className="total-value">
                    ${totalAssets.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* NET WORTH + MONTH SNAPSHOT */}
        <section className="networth-card">
          <div className="card networth-inner">
            <div>
              <h3>Total Assets</h3>
              <p>${totalAssets.toFixed(2)}</p>
            </div>
            <div>
              <h3>Total Debts</h3>
              <p>${totalDebts.toFixed(2)}</p>
            </div>
            <div>
              <h3>Net Worth</h3>
              <p className={netWorth >= 0 ? "positive" : "negative"}>
                ${netWorth.toFixed(2)}
              </p>
            </div>
          </div>
        </section>

        <section className="networth-card">
          <div className="card networth-inner">
            <div>
              <h3>Current Month Fixed / Needs</h3>
              <p>${fixedSpending.toFixed(2)}</p>
            </div>
            <div>
              <h3>Current Month Other Spending</h3>
              <p>${variableSpending.toFixed(2)}</p>
            </div>
            <div>
              <h3>Current Month Total Tracked</h3>
              <p>${totalCurrentMonthSpending.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* PERSONALIZED RECOMMENDATIONS */}
        <section className="card">
          <h2>Personalized Recommendations</h2>
          <p className="disclaimer">
            These are simple rule-based suggestions generated from your
            inputs and are <strong>not</strong> professional financial
            advice.
          </p>
          <ul className="recs-list">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}