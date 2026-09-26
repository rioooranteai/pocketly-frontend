import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, SESSION_COOKIE } from "@/lib/constants";

const { AUTH, ...APP_ROUTES } = ROUTES;

// Signed-in users get sent past these.
const AUTH_ROUTES: string[] = Object.values(AUTH);

// Every app page in ROUTES (and its sub-paths) needs a session. Unknown
// URLs fall through untouched so they still get the 404 page.
const PROTECTED_ROUTES: string[] = Object.values(APP_ROUTES).flatMap((route) =>
  typeof route === "string" ? [route] : Object.values(route)
);

const isProtected = (pathname: string) =>
  PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

/**
 * Optimistic route guard for every page, based only on the session marker
 * cookie (the token lives in localStorage, out of the server's reach).
 * AuthGuard stays the real check on the client, and a 401 from the API
 * still ends the session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE.NAME);

  if (pathname === "/") {
    return redirectTo(
      hasSession ? ROUTES.DASHBOARD : ROUTES.AUTH.LOGIN,
      request
    );
  }

  if (AUTH_ROUTES.includes(pathname)) {
    return hasSession
      ? redirectTo(ROUTES.DASHBOARD, request)
      : NextResponse.next();
  }

  if (isProtected(pathname) && !hasSession) {
    return redirectTo(ROUTES.AUTH.LOGIN, request);
  }

  return NextResponse.next();
}

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

export const config = {
  matcher: [
    /*
     * All pages, except:
     * - api, _next/static, _next/image (framework + API requests)
     * - any path with a file extension (public/ assets, favicon,
     *   mockServiceWorker.js)
     */
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
