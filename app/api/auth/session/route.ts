import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token and get user info from Firebase
    const decoded = await adminAuth.verifyIdToken(idToken);

    const uid = decoded.uid;
    const email = decoded.email || "";
    const nameFromToken = decoded.name || "";
    const picture = decoded.picture || "";

    // Upsert user doc in Firestore: users/{uid}
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      // New user – set defaults
      await userRef.set({
        uid,
        email,
        name: nameFromToken,
        photoURL: picture,
        createdAt: new Date(),
        updatedAt: new Date(),
        netWorth: 0,
        netAssets: 0,
        netDebts: 0,
      });
    } else {
      // Existing user – keep financials, just sync identity + updatedAt
      const existing = snap.data() || {};
      await userRef.set(
        {
          email,
          name: nameFromToken || existing.name || "",
          photoURL: picture || existing.photoURL || "",
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    // Create response + cookie (same behavior you had before)
    const res = NextResponse.json({ ok: true });
    res.cookies.set("firebaseIdToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return res;
  } catch (err) {
    console.error("Error setting session", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("firebaseIdToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
