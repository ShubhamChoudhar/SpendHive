"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Could not send reset email");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card forgot">
        <h1>Reset your password</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Your account email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send reset email</button>
        </form>
        {sent && (
          <p className="auth-success">
            If an account exists for this email, a reset link has been sent.
          </p>
        )}
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-footer">
          Back to <a href="/login">login</a>
        </p>
      </div>
    </main>
  );
}



// "use client";

// import { useState } from "react";
// import { sendPasswordResetEmail } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebaseClient";
// import "../../globals.css";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       await sendPasswordResetEmail(firebaseAuth, email);
//       setSent(true);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message ?? "Could not send reset email");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0,#020617_55%,#000_100%)] px-4 text-slate-50">
//       <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-950/90 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
//         <h1 className="text-2xl font-semibold tracking-wide mb-1">Reset password</h1>
//         <p className="text-sm text-slate-400 mb-6">
//           Enter the email linked to your account and we’ll send you a reset link.
//         </p>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-400/80 bg-red-500/10 px-3 py-2 text-xs text-red-100">
//             {error}
//           </div>
//         )}

//         {sent ? (
//           <div className="rounded-lg border border-emerald-400/80 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100 mb-4">
//             If an account exists for <span className="font-medium">{email}</span>, a reset
//             link has been sent.
//           </div>
//         ) : null}

//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input
//             type="email"
//             placeholder="Email address"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//             className="w-full rounded-lg border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/60"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="mt-1 inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition hover:brightness-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-70 disabled:cursor-wait"
//           >
//             {loading ? "Sending link..." : "Send reset link"}
//           </button>
//         </form>

//         <p className="mt-4 text-xs text-slate-400">
//           Remember your password?{" "}
//           <a href="/login" className="font-medium text-violet-300 hover:underline">
//             Back to login
//           </a>
//         </p>
//       </div>
//     </main>
//   );
// }