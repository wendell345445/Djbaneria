import { redirect } from "next/navigation";

export default function LegacyNewBannerPage() {
  redirect("/dashboard/banners/new");
}
