import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { OwnerSidebar } from "@/components/owner-sidebar";

export default async function OwnerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/owner/login");
  }

  const role = String(user.role ?? "");
  const canAccessOwner =
    isAdminEmail(user.email ?? undefined) ||
    role === "OWNER" ||
    role === "SUPER_ADMIN";

  if (!canAccessOwner) {
    redirect("/dashboard");
  }

  return (
    <OwnerSidebar
      userName={user.name ?? "Owner"}
      userEmail={user.email ?? ""}
    >
      {children}
    </OwnerSidebar>
  );
}
