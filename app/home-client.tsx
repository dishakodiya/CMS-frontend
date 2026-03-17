"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardHref } from "./lib/role-routes";
import { useAuth } from "./lib/use-auth";

export default function HomeClient() {
  const router = useRouter();
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      router.replace(getDashboardHref(user.role));
      router.refresh();
    }
  }, [router, token, user]);

  if (token && user) {
    return (
      <div className="cms-page">
        <div className="cms-card">
          <p className="cms-muted">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <main className="login-card">
        <h1 className="login-title">Clinic CMS</h1>
        <p className="login-subtitle">Please login to continue.</p>
        <Link className="login-button" href="/login">
          Go to login
        </Link>
      </main>
    </div>
  );
}
