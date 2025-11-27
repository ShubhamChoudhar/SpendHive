// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /app routes
  if (pathname.startsWith("/app")) {
    const token = req.cookies.get("firebaseIdToken")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply to all /app routes
export const config = {
  matcher: ["/app/:path*"]
};
