// app/contact/ContactPageClient.tsx
"use client";

import { useState } from "react";

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: send form to API / email service
    setSubmitted(true);
  }

  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-header">
          <div className="page-header-main">
            <h1>Contact us</h1>
            <p>Have questions about SpendHive? Send us a message.</p>
          </div>
        </header>

        <div className="card">
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="expense-form-grid">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="expense-form-actions">
              <button type="submit">Send message</button>
            </div>

            {submitted && (
              <p className="auth-success" style={{ marginTop: "8px" }}>
                Thanks! We’ll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}