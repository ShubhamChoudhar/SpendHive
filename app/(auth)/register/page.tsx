"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import PasswordInput from "@/app/PasswordInput";
import Image from "next/image";

import {
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      // set Firebase displayName
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      // hand token to backend – it will create the Firestore user doc if needed
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);

      // Backend should ensure user document exists (and create it if not)
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not sign up with Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* LEFT – brand side */}
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
            Build a simple, realistic budget and let SpendHive keep everything
            organized for you.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <BanknotesIcon />
              <span>Keep your daily spending under control.</span>
            </div>
            <div className="auth-feature-item">
              <ChartPieIcon />
              <span>Visual breakdown of categories &amp; trends.</span>
            </div>
            <div className="auth-feature-item">
              <CalendarDaysIcon />
              <span>Remember bills &amp; regular payments on time.</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheckIcon />
              <span>Protected with Firebase Authentication.</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT – register form */}
      <section className="auth-right">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="auth-subtitle">
            Get started with SpendHive in less than a minute.
          </p>

          {/* Google sign-up */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              className="auth-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-links">
            <span>
              Already have an account? <Link href="/login">Log in</Link>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}