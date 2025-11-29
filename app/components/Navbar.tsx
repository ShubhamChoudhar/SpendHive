"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/SpendHive.png";
import { useEffect, useState } from "react";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type UserDoc = {
  name?: string;
  email?: string;
  netWorth?: number;
  netAssets?: number;
  netDebts?: number;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();   // ✅ add router

  const isActive = (path: string) =>
    pathname === path ? "nav-link active" : "nav-link";

  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);

      if (!u) {
        setUserDoc(null);
        return;
      }

      try {
        const userRef = doc(firebaseDb, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDoc);
        } else {
          setUserDoc(null);
        }
      } catch (err) {
        console.error("Error fetching user doc:", err);
        setUserDoc(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push("/login");     // ✅ redirect to login
  };

  const displayName =
    userDoc?.name ||
    user?.displayName ||
    "there";

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link href="/" className="nav-logo">
          <Image
            src={Logo}
            alt="SpendHive"
            width={140}
            height={40}
            className="nav-logo-img"
          />
        </Link>

        <div className="nav-links">
          <Link href="/features" className={isActive("/features")}>Features</Link>
          <Link href="/about" className={isActive("/about")}>About</Link>
          <Link href="/contact" className={isActive("/contact")}>Contact</Link>

          {user ? (
            <>
              <Link href="/profile" className={isActive("/profile")}>
                Profile
              </Link>

              <button className="nav-btn logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="nav-link">Sign up</Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
