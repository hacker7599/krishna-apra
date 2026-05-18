import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") {
      throw new Error("role");
    }
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
