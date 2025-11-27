"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import PasswordInput from "@/app/PasswordInput";

import {
  BanknotesIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
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

      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/app");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {/* LEFT – brand side */}
      <section className="auth-left">
        <div className="auth-left-inner">
          <h1>SpendSpectrum</h1>
          <p className="auth-tagline">
            Build a simple, realistic budget and let SpendSpectrum keep
            everything organized for you.
          </p>
  
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <BanknotesIcon />
              <span>Keep your daily spending under control.</span>
            </div>
            <div className="auth-feature-item">
              <ChartPieIcon />
              <span>Visual breakdown of categories & trends.</span>
            </div>
            <div className="auth-feature-item">
              <CalendarDaysIcon />
              <span>Remember bills & regular payments on time.</span>
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
            Get started with SpendSpectrum in less than a minute.
          </p>
  
          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              className="auth-input"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            
            {/* <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            /> */}
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




// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebaseClient";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleRegister(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const cred = await createUserWithEmailAndPassword(
//         firebaseAuth,
//         email,
//         password
//       );

//       if (name) {
//         await updateProfile(cred.user, { displayName: name });
//       }

//       const idToken = await cred.user.getIdToken();
//       await fetch("/api/auth/session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken })
//       });

//       router.push("/");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Could not register");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="auth-page">
//       <div className="auth-card register">
//         <h1>Create your account</h1>
//         <form onSubmit={handleRegister} className="auth-form">
//           <input
//             type="text"
//             placeholder="Full name"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             required
//           />
//           <input
//             type="email"
//             placeholder="Email address"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={loading}>
//             {loading ? "Creating account..." : "Sign up"}
//           </button>
//         </form>
//         {error && <p className="auth-error">{error}</p>}
//         <p className="auth-footer">
//           Already have an account? <a href="/login">Log in</a>
//         </p>
//       </div>
//     </main>
//   );
// }


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebaseClient";
// import "../../globals.css";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleRegister(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
//       if (name) {
//         await updateProfile(cred.user, { displayName: name });
//       }

//       const idToken = await cred.user.getIdToken();
//       await fetch("/api/auth/session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });

//       router.push("/");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Could not register");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0,#020617_55%,#000_100%)] px-4 text-slate-50">
//       <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-950/90 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
//         <h1 className="text-2xl font-semibold tracking-wide mb-1">Create your account</h1>
//         <p className="text-sm text-slate-400 mb-6">
//           Sign up to save your budgets, goals, and progress securely to the cloud.
//         </p>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-400/80 bg-red-500/10 px-3 py-2 text-xs text-red-100">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleRegister} className="space-y-3">
//           <input
//             type="text"
//             placeholder="Full name"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             required
//             className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//           />
//           <input
//             type="email"
//             placeholder="Email address"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//             className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//             className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="mt-1 inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:brightness-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-70 disabled:cursor-wait"
//           >
//             {loading ? "Creating account..." : "Sign up"}
//           </button>
//         </form>

//         <p className="mt-4 text-xs text-slate-400">
//           Already have an account?{" "}
//           <a href="/login" className="font-medium text-violet-300 hover:underline">
//             Log in
//           </a>
//         </p>
//       </div>
//     </main>
//   );
// }