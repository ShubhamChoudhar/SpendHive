// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Optional: verify the token here (good practice)
    await adminAuth.verifyIdToken(idToken);

    const res = NextResponse.json({ ok: true });
    // simple cookie; you could also create a Firebase session cookie
    res.cookies.set("firebaseIdToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 5 // 5 days
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
    maxAge: 0
  });
  return res;
}
