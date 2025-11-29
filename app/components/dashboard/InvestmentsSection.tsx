// components/dashboard/InvestmentsSection.tsx
import React from "react";

export type InvestingState = {
  currentHoldings: string;
  riskTolerance: string;
  expectedAnnualReturn: string;
  monthlyInvestForGoals: string;
  houseGoalAmount: string;
  houseGoalYears: string;
  educationGoalAmount: string;
  educationGoalYears: string;
};

type Props = {
  investing: InvestingState;
  handleInvestingChange: (field: keyof InvestingState, value: string) => void;

  expectedAnnualReturnRate: number;
  monthlySavings: number;
  projectedRetirementFV: number;

  houseGoalAmount: number;
  houseGoalYears: number;
  requiredMonthlyHouse: number;
  projectedHouseFV: number;

  educationGoalAmount: number;
  educationGoalYears: number;
  requiredMonthlyEducation: number;
  projectedEducationFV: number;

  monthlyInvestForGoals: number;
};

export default function InvestmentsSection({
  investing,
  handleInvestingChange,
  expectedAnnualReturnRate,
  monthlySavings,
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
}: Props) {
  return (
    <section className="card goals-income-card">
      <h2>Investments & Risk Profile</h2>
      <div className="goals-income-grid">
        {/* LEFT: Current Portfolio */}
        <div>
          <h3>Current Portfolio</h3>

          <label>Stocks / ETFs / Mutual Funds</label>
          <textarea
            rows={4}
            value={investing.currentHoldings}
            onChange={(e) =>
              handleInvestingChange("currentHoldings", e.target.value)
            }
            placeholder="List your main holdings, e.g. S&P 500 index fund, international equity fund, bond fund, etc."
          />

          <label>Monthly amount invested for long-term goals</label>
          <input
            type="number"
            min="0"
            value={investing.monthlyInvestForGoals}
            onChange={(e) =>
              handleInvestingChange("monthlyInvestForGoals", e.target.value)
            }
            placeholder="How much you invest monthly toward house, kids, etc."
          />

          <label>Expected long-term annual return (%)</label>
          <input
            type="number"
            min="0"
            value={investing.expectedAnnualReturn}
            onChange={(e) =>
              handleInvestingChange("expectedAnnualReturn", e.target.value)
            }
            placeholder="e.g. 6–8 (just a planning assumption)"
          />
        </div>

        {/* RIGHT: Goals & Risk */}
        <div>
          <h3>Goals & Risk</h3>

          <label>House fund target & years</label>
          <div className="inline-inputs">
            <input
              type="number"
              min="0"
              value={investing.houseGoalAmount}
              onChange={(e) =>
                handleInvestingChange("houseGoalAmount", e.target.value)
              }
              placeholder="Amount"
            />
            <input
              type="number"
              min="0"
              value={investing.houseGoalYears}
              onChange={(e) =>
                handleInvestingChange("houseGoalYears", e.target.value)
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
              onChange={(e) =>
                handleInvestingChange("educationGoalAmount", e.target.value)
              }
              placeholder="Amount"
            />
            <input
              type="number"
              min="0"
              value={investing.educationGoalYears}
              onChange={(e) =>
                handleInvestingChange("educationGoalYears", e.target.value)
              }
              placeholder="Years"
            />
          </div>

          <label>Risk tolerance</label>
          <select
            value={investing.riskTolerance}
            onChange={(e) =>
              handleInvestingChange("riskTolerance", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Aggressive">Aggressive</option>
          </select>

          {/* Retirement projection box */}
          {expectedAnnualReturnRate > 0 &&
            monthlySavings > 0 &&
            projectedRetirementFV > 0 && (
              <div className="goals-income-summary">
                <p>
                  With your current monthly investing of{" "}
                  <strong>${monthlySavings.toFixed(2)}</strong> and an assumed{" "}
                  <strong>{expectedAnnualReturnRate.toFixed(1)}%</strong> annual
                  return, a rough projection at retirement is:{" "}
                  <strong>${projectedRetirementFV.toFixed(0)}</strong> (not
                  guaranteed).
                </p>
              </div>
            )}

          {/* House & Education projections (optional extra info) */}
          {(houseGoalAmount > 0 || educationGoalAmount > 0) && (
            <div className="goals-income-summary">
              {houseGoalAmount > 0 && houseGoalYears > 0 && (
                <p>
                  House goal: target ${houseGoalAmount.toLocaleString()} in{" "}
                  {houseGoalYears} years.
                  {requiredMonthlyHouse > 0 && (
                    <>
                      {" "}
                      Rough monthly needed:{" "}
                      <strong>${requiredMonthlyHouse.toFixed(2)}</strong>. With
                      your current plan, projection ≈{" "}
                      <strong>${projectedHouseFV.toFixed(0)}</strong>.
                    </>
                  )}
                </p>
              )}

              {educationGoalAmount > 0 && educationGoalYears > 0 && (
                <p>
                  Education goal: target $
                  {educationGoalAmount.toLocaleString()} in{" "}
                  {educationGoalYears} years.
                  {requiredMonthlyEducation > 0 && (
                    <>
                      {" "}
                      Rough monthly needed:{" "}
                      <strong>${requiredMonthlyEducation.toFixed(2)}</strong>.
                      With your current plan (≈$
                      {monthlyInvestForGoals.toFixed(2)}/month), projection ≈{" "}
                      <strong>${projectedEducationFV.toFixed(0)}</strong>.
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}