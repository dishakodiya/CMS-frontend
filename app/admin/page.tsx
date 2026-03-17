"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "../components/auth-gate";
import AppShell from "../components/app-shell";
import { cmsFetchJson, CmsApiError } from "../lib/cms-client";
type ClinicInfo = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  userCount: number;
  appointmentCount: number;
  queueCount: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
};

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role: "receptionist" | "patient" | "doctor";
  phone?: string;
};

export default function AdminPage() {
  return (
    <AuthGate allow={["admin"]} title="Admin">
      {({ token }) => <AdminInner token={token} />}
    </AuthGate>
  );
}

function AdminInner({ token }: { token: string }) {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUserBody>({
    name: "",
    email: "",
    password: "",
    role: "patient",
    phone: "",
  });
  const [creating, setCreating] = useState(false);

  const canCreate = useMemo(() => {
    return (
      form.name.trim().length >= 3 &&
      form.email.trim().length > 0 &&
      form.password.trim().length >= 6
    );
  }, [form]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, u] = await Promise.all([
        cmsFetchJson<ClinicInfo>("/admin/clinic", { token }),
        cmsFetchJson<AdminUser[]>("/admin/users", { token }),
      ]);
      setClinic(c);
      setUsers(u);
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Fail to get data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate || creating) return;

    setCreating(true);
    setError(null);
    try {
      await cmsFetchJson<AdminUser>("/admin/users", {
        method: "POST",
        token,
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone?.trim() ? form.phone : undefined,
        },
      });
      setForm({ name: "", email: "", password: "", role: "patient", phone: "" });
      await load();
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Fail to add user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell title="Admin Dashboard">

          {loading ? <p className="dash-muted">Loading…</p> : null}
          {error ? <p className="dash-muted">Error: {error}</p> : null}

          {clinic ? (
            <div style={{ marginTop: 12 }}>
              <p className="dash-muted">
                <b>{clinic.name}</b>  ({clinic.code})  users: {clinic.userCount}, appointments:{" "}
                {clinic.appointmentCount}, queue: {clinic.queueCount}
              </p>
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <h2 className="dash-h2">Add user</h2>
            <form onSubmit={onCreateUser} className="dash-row" autoComplete="off">
              <input
                className="login-input"
                placeholder="Name"
                name="new_user_name"
                autoComplete="off"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="login-input"
                placeholder="Email"
                name="new_user_email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
              />
              <input
                className="login-input"
                placeholder="Password"
                name="new_user_password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="password"
              />
              <select
                className="login-input"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as CreateUserBody["role"] }))
                }
              >
                <option value="patient">patient</option>
                <option value="doctor">doctor</option>
                <option value="receptionist">receptionist</option>
              </select>
              <input
                className="login-input"
                placeholder="Phone"
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <button className="dash-btn" type="submit">
                {creating ? "Creating…" : "Create"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 18 }}>
            <h2 className="dash-h2">Users</h2>
            <div className="dash-tableWrap" style={{ marginTop: 8 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.phone ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </AppShell>
  );
}




