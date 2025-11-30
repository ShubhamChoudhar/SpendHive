"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { firebaseAuth } from "@/lib/firebaseClient";
import PasswordInput from "@/app/PasswordInput";
import Image from "next/image";

import {
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/");
    } catch (err: any) {
      // console.error(err);
      const code = (err as FirebaseError)?.code;

      if (code === "auth/user-not-found") {
        setError("User not registered. Please create an account first.");
      } else if (code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError(
          "Too many failed attempts. Please wait a bit and try again, or reset your password."
        );
      } else {
        setError("Could not sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);

      // Backend will check if the user doc exists in Firestore and create it if needed
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not sign in with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* LEFT SIDE – BRAND / FEATURES */}
      <section className="auth-left">
        <div className="auth-left-inner">
          <Image
            src="/SpendHive.png"
            alt="SpendHive"
            width={200}
            height={48}
            className="auth-logo"
            priority
          />
          <p className="auth-tagline">
            Track everyday expenses, stay on top of your budget, and hit your
            savings goals — all in one simple dashboard.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <BanknotesIcon />
              <span>Capture every expense in seconds.</span>
            </div>
            <div className="auth-feature-item">
              <ChartPieIcon />
              <span>See where your money actually goes.</span>
            </div>
            <div className="auth-feature-item">
              <CalendarDaysIcon />
              <span>Compare months &amp; spot spending patterns.</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheckIcon />
              <span>Secure login powered by Firebase.</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE – LOGIN FORM */}
      <section className="auth-right">
        <div className="auth-card">
          <h2>Log in</h2>
          <p className="auth-subtitle">
            Access your SpendHive dashboard and pick up where you left off.
          </p>

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleEmailLogin} className="auth-form">
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-links">
            <Link href="/forgot-password">Forgot password?</Link>
            <span>
              New here? <Link href="/register">Create an account</Link>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}