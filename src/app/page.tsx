import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Root route has no content of its own. src/proxy.ts normally redirects
 * it (to /dashboard or /login) before this renders; this is the fallback.
 */
export default function RootPage() {
  redirect(ROUTES.AUTH.LOGIN);
}
