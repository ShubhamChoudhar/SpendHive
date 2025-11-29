import React from "react";

type TopSummaryBarProps = {
  netWorth: number;
  savingsRate: number;
  monthlyNet: number;
  needsPercentOfIncome: number;
  wantsPercentOfIncome: number;
  savingsPercentOfIncome: number;
  fiftyStatus: string;
  fiftyStatusClass: string;
};

export default function TopSummaryBar({
  netWorth,
  savingsRate,
  monthlyNet,
  needsPercentOfIncome,
  wantsPercentOfIncome,
  savingsPercentOfIncome,
  fiftyStatus,
  fiftyStatusClass,
}: TopSummaryBarProps) {
  return (
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
  );
}