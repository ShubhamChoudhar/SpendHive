import React from "react";

type Expense = {
  id: number;
  category: string;
  amount: number;
  date: string;
  notes: string;
};

type ExpensesSectionProps = {
  expenseCategories: string[];
  category: string;
  setCategory: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  loadingExpenses: boolean;
  expensesSorted: Expense[];
  totalExpenses: number;
  // 🟢 single add handler prop
  onAddExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDeleteExpense: (id: number) => void;
};

export default function ExpensesSection({
  expenseCategories,
  category,
  setCategory,
  amount,
  setAmount,
  date,
  setDate,
  notes,
  setNotes,
  loadingExpenses,
  expensesSorted,
  totalExpenses,
  onAddExpense,
  handleDeleteExpense,
}: ExpensesSectionProps) {
  return (
    <section className="card">
      <h2>Expenses Sheet</h2>

      {/* use onAddExpense here */}
      <form className="expense-form" onSubmit={onAddExpense}>
        <div className="expense-form-grid">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {expenseCategories.map((cat) => (
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
            onChange={(e) => setAmount(e.target.value)}
          />

          <label htmlFor="date">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label htmlFor="notes">Description / Notes:</label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
              expensesSorted.map((exp) => (
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
              <td className="total-value">${totalExpenses.toFixed(2)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}