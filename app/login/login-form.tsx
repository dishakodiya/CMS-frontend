"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAuth } from "../lib/auth-storage";
import { getDashboardHref } from "../lib/role-routes";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuth(data.token, data.user);
        router.replace(getDashboardHref(data.user?.role ?? ""));
        router.refresh();
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("cannot find cms API ");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="login-field" style={{ marginBottom: "14px" }}>
        <label htmlFor="email" className="login-label">Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="login-input"
        />
      </div>

      <div className="login-field">
        <label htmlFor="password" className="login-label">Password</label>
        <input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="login-input"
          required
        />
      </div>

      {error && <div className="login-error">{error}</div>}

      <button type="submit" className="login-button">Login</button>
    </form>
  );
}






