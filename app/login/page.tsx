"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./login-form";
import { useAuth } from "../lib/use-auth";
import { getDashboardHref } from "../lib/role-routes";

export default function LoginPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      router.replace(getDashboardHref(user.role));
      router.refresh();
    }
  }, [router, token, user]);

  return (
    <div className="login-page">
      <main className="login-card">
        <h1 className="login-title">CMS Login</h1>
        <p className="login-subtitle">Sign in.</p>
        <LoginForm />
      </main>
    </div>
  );
}

