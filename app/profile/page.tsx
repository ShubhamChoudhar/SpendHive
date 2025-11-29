// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  type User,
} from "firebase/auth";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

interface ProfileData {
  name?: string;
  email?: string | null;
  netWorth?: number;
  netAssets?: number;
  netDebts?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  // Settings – change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      try {
        // summary doc written by dashboard autosave
        const userRef = doc(firebaseDb, "users", u.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() || {} : {};

        setProfileData({
          name: data.name || u.displayName || "",
          email: u.email,
          netWorth: data.netWorth ?? 0,
          netAssets: data.netAssets ?? 0,
          netDebts: data.netDebts ?? 0,
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoadError("Could not load your profile details.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return <p className="p-6">Loading profile...</p>;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    if (!user) return;

    if (newPassword !== confirmNewPassword) {
      setSettingsError("New password and confirmation do not match.");
      return;
    }

    try {
      if (!user.email) {
        setSettingsError("Password change is not available for this account.");
        return;
      }

      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSettingsSuccess("Password updated successfully.");
    } catch (err: any) {
      console.error(err);
      setSettingsError(err?.message ?? "Could not update password.");
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const idToken = await user.getIdToken();
      await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      await deleteUser(user);
      router.push("/register");
    } catch (err: any) {
      console.error(err);
      setSettingsError(err?.message ?? "Could not delete account.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>

        {/* Back to dashboard */}
        <Link
          href="/"
          className="rounded-full px-4 py-2 bg-slate-100 text-sm"
          style={{ textDecoration: "none", color: "#0ea5e9" }}
        >
          ← Back to dashboard
        </Link>
      </div>

      {loadError && (
        <p className="mb-4 text-sm text-red-500">{loadError}</p>
      )}

      {/* Basic info */}
      <div className="rounded-xl border border-slate-200 p-6 mb-8 bg-white">
        <h2 className="text-lg font-medium mb-4">Account Info</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name: </span>
            {profileData.name}
          </p>
          <p>
            <span className="font-medium">Email: </span>
            {profileData.email}
          </p>
        </div>
      </div>

      {/* Financial summary */}
      <div className="rounded-xl border border-slate-200 p-6 mb-8 bg-white">
        <h2 className="text-lg font-medium mb-4">Financial Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Net Worth</p>
            <p className="text-lg font-semibold">
              {profileData.netWorth !== undefined
                ? `$${profileData.netWorth.toFixed(2)}`
                : "$0.00"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Net Assets</p>
            <p className="text-lg font-semibold">
              {profileData.netAssets !== undefined
                ? `$${profileData.netAssets.toFixed(2)}`
                : "$0.00"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Net Debts</p>
            <p className="text-lg font-semibold">
              {profileData.netDebts !== undefined
                ? `$${profileData.netDebts.toFixed(2)}`
                : "$0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-slate-200 p-6 bg-white">
        <h2 className="text-lg font-medium mb-4">Settings</h2>

        <form onSubmit={handleChangePassword} className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm">Change password</h3>
          <input
            type="password"
            className="auth-input"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn w-fit">
            Update password
          </button>
        </form>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete account
        </button>

        {settingsError && (
          <p className="mt-3 text-sm text-red-500">{settingsError}</p>
        )}
        {settingsSuccess && (
          <p className="mt-3 text-sm text-emerald-600">{settingsSuccess}</p>
        )}
      </div>
    </div>
  );
}