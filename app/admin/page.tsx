import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "ניהול",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container section">
      <AdminPanel />
    </div>
  );
}
