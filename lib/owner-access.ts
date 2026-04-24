import "server-only";

import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export async function canAccessOwnerArea() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      user: null,
    };
  }

  const role = String(user.role ?? "");
  const allowed =
    isAdminEmail(user.email ?? undefined) ||
    role === "OWNER" ||
    role === "SUPER_ADMIN";

  return {
    ok: allowed,
    user,
  } as const;
}
