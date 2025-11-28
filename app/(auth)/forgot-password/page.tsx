"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p className="auth-subtitle">
          Enter the email linked to your account and we’ll send you a reset
          link.
        </p>

        {error && <p className="auth-error">{error}</p>}

        {sent && (
          <p className="auth-success">
            If an account exists for <strong>{email}</strong>, a reset link has
            been sent.
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-links">
          <span className="auth-links-span">Remember your password?{" "}
            <Link href="/login">Back to login</Link>
          </span>
        </p>
      </div>
    </main>
  );
}