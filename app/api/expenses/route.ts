// app/api/expenses/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

async function getUidFromRequest(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/firebaseIdToken=([^;]+)/);
  if (!match) return null;

  const token = decodeURIComponent(match[1]);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    console.error("verifyIdToken failed", err);
    return null;
  }
}

export async function GET(req: Request) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("expenses")
    .orderBy("date", "asc")
    .get();

  const expenses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // expected: { category, amount, date, notes }
  const data = {
    category: body.category,
    amount: Number(body.amount) || 0,
    date: body.date,
    notes: body.notes ?? "",
    createdAt: new Date().toISOString()
  };

  const docRef = await adminDb
    .collection("users")
    .doc(uid)
    .collection("expenses")
    .add(data);

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
