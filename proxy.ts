import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only (no DB): bounce visitors without a session cookie to
// the login page. The real check is requireUser() in every admin page/action.
const SESSION_COOKIE = "noir_admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
