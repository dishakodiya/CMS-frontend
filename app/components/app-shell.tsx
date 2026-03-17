"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "../lib/auth-storage";
import { getDashboardHref, getRoleLabel } from "../lib/role-routes";
import { useAuth } from "../lib/use-auth";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuth();

  const dashboardHref = user ? getDashboardHref(user.role) : "/";

  return (
    <div className="dash-page">
      <header className="dash-nav">
        <div className="dash-nav-inner">
          <div className="dash-title">{title}</div>

          <nav className="dash-links" aria-label="Primary">{user ? (
              <Link
                className={pathname === dashboardHref ? "dash-link dash-link-active" : "dash-link"}
                href={dashboardHref}
              >
                {getRoleLabel(user.role)} Dashboard
              </Link>
            ) : null}
          </nav>

          <div className="dash-actions">
            {user ? (
              <div className="dash-user" title={user.email}>
                <span className="dash-userName">{user.name}</span>
                <span className="dash-badge">{getRoleLabel(user.role)}</span>
              </div>
            ) : null}
            {token && user ? (
              <button
                className="dash-btn dash-btn-secondary"
                type="button"
                onClick={() => {
                  clearAuth();
                  router.push("/login");
                  router.refresh();
                }}
              >
                Logout
              </button>
            ) : (
              <Link className="dash-btn dash-btn-secondary" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-container">{children}</div>
      </main>
    </div>
  );
}

