// components/dashboard/GoalsIncomeSection.tsx
import React from "react";

export type GoalsState = {
  shortTerm: string;
  longTerm: string;
  vacation: string;
  holidays: string;
  retirementTargetAmount: string;
  retirementYearsFromNow: string;
};

export type IncomeState = {
  monthlyGross: string;
  monthlyNet: string;
  currentMonthlySavings: string;
  savingsIncreasePercent: string;
  savingsIncreaseYears: string;
};

type Props = {
  goals: GoalsState;
  income: IncomeState;
  handleGoalsChange: (field: keyof GoalsState, value: string) => void;
  handleIncomeChange: (field: keyof IncomeState, value: string) => void;

  monthlyNet: number;
  savingsRate: number;
  projectedMonthlySavings: number;
  retirementTargetAmount: number;
  retirementYearsFromNow: number;
  expectedAnnualReturnRate: number;
  requiredMonthlyRetirement: number;
};

export default function GoalsIncomeSection({
  goals,
  income,
  handleGoalsChange,
  handleIncomeChange,
  monthlyNet,
  savingsRate,
  projectedMonthlySavings,
  retirementTargetAmount,
  retirementYearsFromNow,
  expectedAnnualReturnRate,
  requiredMonthlyRetirement,
}: Props) {
  const monthlySavings = Number(income.currentMonthlySavings) || 0;

  return (
    <section className="card goals-income-card">
      <h2>Goals & Income</h2>
      <div className="goals-income-grid">
        {/* LEFT: Goals */}
        <div>
          <h3>Goals</h3>

          <label>Short-term goals (1–2 years)</label>
          <textarea
            rows={2}
            value={goals.shortTerm}
            onChange={(e) => handleGoalsChange("shortTerm", e.target.value)}
            placeholder="e.g. Build $25,000 emergency fund, pay off one credit card..."
          />

          <label>Long-term goals (5+ years)</label>
          <textarea
            rows={2}
            value={goals.longTerm}
            onChange={(e) => handleGoalsChange("longTerm", e.target.value)}
            placeholder="e.g. Buy a house, kids’ education, financial independence..."
          />

          <label>Vacation / Travel goals</label>
          <textarea
            rows={2}
            value={goals.vacation}
            onChange={(e) => handleGoalsChange("vacation", e.target.value)}
            placeholder="Where do you want to go and roughly how much will it cost?"
          />

          <label>Festivals / Holidays spending</label>
          <textarea
            rows={2}
            value={goals.holidays}
            onChange={(e) => handleGoalsChange("holidays", e.target.value)}
            placeholder="e.g. Diwali/Christmas gifts budget, family visits, etc."
          />

          <label>Retirement target amount</label>
          <input
            type="number"
            min="0"
            value={goals.retirementTargetAmount}
            onChange={(e) =>
              handleGoalsChange("retirementTargetAmount", e.target.value)
            }
            placeholder="How much do you want to have at retirement?"
          />

          <label>Years until retirement</label>
          <input
            type="number"
            min="0"
            value={goals.retirementYearsFromNow}
            onChange={(e) =>
              handleGoalsChange("retirementYearsFromNow", e.target.value)
            }
            placeholder="e.g. 30"
          />
        </div>

        {/* RIGHT: Income & Savings */}
        <div>
          <h3>Income & Savings</h3>

          <label>Monthly income (before tax)</label>
          <input
            type="number"
            min="0"
            value={income.monthlyGross}
            onChange={(e) =>
              handleIncomeChange("monthlyGross", e.target.value)
            }
            placeholder="Total monthly salary / income"
          />

          <label>Monthly in-hand income (after tax)</label>
          <input
            type="number"
            min="0"
            value={income.monthlyNet}
            onChange={(e) =>
              handleIncomeChange("monthlyNet", e.target.value)
            }
            placeholder="What actually hits your bank account"
          />

          <label>Current monthly savings / investments</label>
          <input
            type="number"
            min="0"
            value={income.currentMonthlySavings}
            onChange={(e) =>
              handleIncomeChange("currentMonthlySavings", e.target.value)
            }
            placeholder="Total per month going into savings, SIPs, etc."
          />

          <label>Plan to increase savings by (%) every few years</label>
          <input
            type="number"
            min="0"
            value={income.savingsIncreasePercent}
            onChange={(e) =>
              handleIncomeChange("savingsIncreasePercent", e.target.value)
            }
            placeholder="e.g. 2 or 3"
          />

          <label>Every how many years?</label>
          <input
            type="number"
            min="0"
            value={income.savingsIncreaseYears}
            onChange={(e) =>
              handleIncomeChange("savingsIncreaseYears", e.target.value)
            }
            placeholder="e.g. 1 or 5"
          />

          {monthlyNet > 0 && (
            <div className="goals-income-summary">
              <p>
                Current savings rate:{" "}
                <strong>{(savingsRate * 100 || 0).toFixed(1)}%</strong> of
                in-hand income.
              </p>

              {projectedMonthlySavings > monthlySavings && (
                <p>
                  Projected monthly savings after step-up:{" "}
                  <strong>${projectedMonthlySavings.toFixed(2)}</strong>.
                </p>
              )}

              {retirementTargetAmount > 0 &&
                retirementYearsFromNow > 0 &&
                expectedAnnualReturnRate >= 0 && (
                  <p>
                    Rough monthly saving needed for retirement goal (with your
                    assumed {expectedAnnualReturnRate || 0}% return):{" "}
                    <strong>${requiredMonthlyRetirement.toFixed(2)}</strong>.
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}