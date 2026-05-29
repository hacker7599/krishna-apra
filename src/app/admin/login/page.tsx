import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <AdminLoginForm />
    </div>
  );
}
