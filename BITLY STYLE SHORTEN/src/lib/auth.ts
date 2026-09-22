const AUTH_ROUTES = [
  "/auth",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Validate an ordinary (non-recovery) post-auth destination.
 * Accepts only same-origin paths starting with exactly one "/",
 * rejecting absolute/protocol-relative URLs and every auth workflow route.
 */
export function validateOrdinaryPostAuthNext(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";

  const isAuthRoute = AUTH_ROUTES.some((r) => next === r || next.startsWith(`${r}/`));
  if (isAuthRoute) return "/dashboard";

  return next;
}

export function getCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}