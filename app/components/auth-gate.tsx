"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "../lib/auth-storage";
import { useAuth } from "../lib/use-auth";

export default function AuthGate({
  allow,
  title,
  children,
}: {
  allow: string[];
  title: string;
  children: (args: { token: string; role: string }) => ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuth();

  if (!token || !user) {
    return (
      <div className="cms-page">
        <div className="cms-card">
          <h1 className="cms-h1">{title}</h1>
          <p className="cms-muted">Please sign in first.</p>
          <Link className="cms-btn" href="/login">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!allow.includes(user.role)) {
    return (
      <div className="cms-page">
        <div className="cms-card">
          <h1 className="cms-h1">{title}</h1>
          <p className="cms-muted">
            Signed in as <b>{user.role}</b>. You do not have access to this page.
          </p>
          <div className="cms-row">
            <Link className="cms-btn" href="/">
              Home
            </Link>
            <button
              className="cms-btn cms-btn-secondary"
              type="button"
              onClick={() => {
                clearAuth();
                router.push("/login");
                router.refresh();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children({ token, role: user.role })}</>;
}
