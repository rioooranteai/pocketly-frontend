import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Root route has no content of its own — redirects to login. Once we
 * have server-side session awareness (e.g. an auth cookie), this can
 * branch to /dashboard for already-authenticated users instead.
 */
export default function RootPage() {
  redirect(ROUTES.AUTH.LOGIN);
}
