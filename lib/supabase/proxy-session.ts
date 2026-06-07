import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth token on every request and (once routes exist)
 * gates access. Called from the root `proxy.ts` (Next.js 16's replacement for
 * `middleware.ts`).
 *
 * Auth/onboarding redirect logic is layered on in M1, when the (auth) and (app)
 * route groups exist. For now this only keeps the session fresh.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getClaims().
  // getClaims() validates the JWT signature and refreshes the token; it is the
  // only auth call that is safe to trust in server/proxy code.
  const { data } = await supabase.auth.getClaims();
  const authed = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";
  const isPublic = isAuthPage || path.startsWith("/auth");

  // Unauthenticated users may only see public pages.
  if (!authed && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users shouldn't sit on the auth pages.
  if (authed && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // The onboarding gate is enforced in app/(app)/layout.tsx + app/page.tsx,
  // which already query the profile (avoids a per-request DB call here).
  return response;
}
