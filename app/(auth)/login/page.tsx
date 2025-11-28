"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
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
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not sign in");
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
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/app");
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
            width={200}        // tweak these two values
            height={48}        // to match your logo aspect ratio
            className="auth-logo"
            priority           // logo loads fast
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
              <span>Compare months & spot spending patterns.</span>
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
              onChange={e => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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




// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup
// } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebaseClient";

// const googleProvider = new GoogleAuthProvider();

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function afterAuthSuccess() {
//     const user = firebaseAuth.currentUser;
//     if (!user) return;
//     const idToken = await user.getIdToken();
//     await fetch("/api/auth/session", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ idToken })
//     });
//     router.push("/");
//   }

//   async function handleEmailLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       await signInWithEmailAndPassword(firebaseAuth, email, password);
//       await afterAuthSuccess();
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleGoogleLogin() {
//     setError(null);
//     setLoading(true);
//     try {
//       await signInWithPopup(firebaseAuth, googleProvider);
//       await afterAuthSuccess();
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Google login failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="auth-page">
//       <div className="auth-card">
//         <h1>Log in</h1>

//         <button
//           type="button"
//           className="google-btn"
//           onClick={handleGoogleLogin}
//           disabled={loading}
//         >
//           Continue with Google
//         </button>

//         <div className="divider">
//           {/* <span>or</span> */}
//         </div>

//         <form onSubmit={handleEmailLogin} className="auth-form">
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
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         {error && <p className="auth-error">{error}</p>}

//         <p className="auth-footer">
//           <a href="/forgot-password">Forgot password?</a>
//         </p>
//         <p className="auth-footer">
//           New here? <a href="/register">Create an account</a>
//         </p>
//       </div>
//     </main>
//   );
// }



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebaseClient";
// import "../../globals.css";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleEmailLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
//       const idToken = await cred.user.getIdToken();
//       await fetch("/api/auth/session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });
//       router.push("/");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Could not sign in");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleGoogleLogin() {
//     setError(null);
//     setLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       const cred = await signInWithPopup(firebaseAuth, provider);
//       const idToken = await cred.user.getIdToken();
//       await fetch("/api/auth/session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });
//       router.push("/");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Could not sign in with Google");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0,#020617_55%,#000_100%)] px-4 text-slate-50">
//       <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-950/90 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
//         <h1 className="text-2xl font-semibold tracking-wide mb-1">Log in</h1>
//         <p className="text-sm text-slate-400 mb-6">
//           Access your budget dashboard and pick up where you left off.
//         </p>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-400/80 bg-red-500/10 px-3 py-2 text-xs text-red-100">
//             {error}
//           </div>
//         )}

//         <button
//           type="button"
//           onClick={handleGoogleLogin}
//           disabled={loading}
//           className="mb-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-500/70 bg-slate-900/80 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-900 hover:border-slate-300/90 disabled:opacity-70 disabled:cursor-wait"
//         >
//           {/* you can add an icon here if you want */}
//           Continue with Google
//         </button>

//         <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
//           <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
//           <span>or</span>
//           <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
//         </div>

//         <form onSubmit={handleEmailLogin} className="space-y-3">
//           <div>
//             <input
//               type="email"
//               placeholder="Email address"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               required
//               className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//             />
//           </div>
//           <div>
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               required
//               className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="mt-1 inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:brightness-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-70 disabled:cursor-wait"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
//           <a href="/forgot-password" className="hover:text-violet-300 hover:underline">
//             Forgot password?
//           </a>
//           <span>
//             New here?{" "}
//             <a href="/register" className="font-medium text-violet-300 hover:underline">
//               Create an account
//             </a>
//           </span>
//         </div>
//       </div>
//     </main>
//   );
// }