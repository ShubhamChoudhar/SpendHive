// components/dashboard/DebtsAssetsSection.tsx
import React from "react";

export type DebtsState = {
  mortgage: string;
  carLoan: string;
  creditCards: string;
  personalLoan: string;
  studentLoan: string;
  otherDebt: string;
  numberOfCreditCards: string;
  highestCardAPR: string;
  avgDebtAPR: string;
};

export type AssetsState = {
  cash: string;
  savingsAccount: string;
  checkingAccount: string;
  hsa: string;
  investments: string;
  retirement: string;
  property: string;
  otherAssets: string;
};

type Props = {
  debts: DebtsState;
  assets: AssetsState;
  handleDebtChange: (field: keyof DebtsState, value: string) => void;
  handleAssetChange: (field: keyof AssetsState, value: string) => void;

  totalDebts: number;
  totalAssets: number;
  netWorth: number;

  fixedSpending: number;
  variableSpending: number;
  totalCurrentMonthSpending: number;
};

export default function DebtsAssetsSection({
  debts,
  assets,
  handleDebtChange,
  handleAssetChange,
  totalDebts,
  totalAssets,
  netWorth,
  fixedSpending,
  variableSpending,
  totalCurrentMonthSpending,
}: Props) {
  return (
    <>
      {/* DEBTS & ASSETS TABLES */}
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
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                    onChange={(e) =>
                      handleDebtChange("creditCards", e.target.value)
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
                    onChange={(e) =>
                      handleDebtChange("personalLoan", e.target.value)
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
                    onChange={(e) =>
                      handleDebtChange("studentLoan", e.target.value)
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
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                    onChange={(e) =>
                      handleDebtChange("highestCardAPR", e.target.value)
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
                    onChange={(e) =>
                      handleDebtChange("avgDebtAPR", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="total-label">Total Debts</td>
                <td className="total-value">${totalDebts.toFixed(2)}</td>
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
                    onChange={(e) =>
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
                    onChange={(e) =>
                      handleAssetChange("savingsAccount", e.target.value)
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
                    onChange={(e) =>
                      handleAssetChange("checkingAccount", e.target.value)
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
                    onChange={(e) =>
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
                    onChange={(e) =>
                      handleAssetChange("investments", e.target.value)
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
                    onChange={(e) =>
                      handleAssetChange("retirement", e.target.value)
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
                    onChange={(e) =>
                      handleAssetChange("property", e.target.value)
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
                    onChange={(e) =>
                      handleAssetChange("otherAssets", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="total-label">Total Assets</td>
                <td className="total-value">${totalAssets.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* NET WORTH + MONTH SNAPSHOT CARDS */}
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
    </>
  );
}