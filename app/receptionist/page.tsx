"use client";

import { useEffect, useState } from "react";
import AuthGate from "../components/auth-gate";
import AppShell from "../components/app-shell";
import { cmsFetchJson, CmsApiError } from "../lib/cms-client";

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type QueueItem = {
  id: number;
  queueDate: string;
  tokenNumber: number;
  status: "waiting" | "in_progress" | "done" | "skipped";
  appointmentId: number;
  clinicId: number;
  createdAt: string;
  appointment?: {
    id: number;
    timeSlot: string;
    patient?: { name: string; phone: string };
  };
};

export default function ReceptionistPage() {
  return (
    <AuthGate allow={["receptionist"]} title="Receptionist">
      {({ token }) => <Inner token={token} />}
    </AuthGate>
  );
}

function Inner({ token }: { token: string }) {
  const [date, setDate] = useState(todayYYYYMMDD());
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await cmsFetchJson<QueueItem[]>(`/queue?date=${encodeURIComponent(date)}`, {
        token,
      });
      setItems(list);
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, date]);

  async function updateStatus(id: number, status: "in-progress" | "done" | "skipped") {
    setUpdatingId(id);
    setError(null);
    try {
      await cmsFetchJson(`/queue/${id}`, {
        method: "PATCH",
        token,
        body: { status },
      });
      await load();
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AppShell title="Receptionist Dashboard">
      <div className="dash-panel">
        <h1 className="dash-h2">Receptionist Dashboard</h1>

        <div className="cms-row" style={{ marginTop: 12 }}>
          <label className="cms-muted">Date</label>
          <input className="login-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="cms-btn cms-btn-secondary" type="button" onClick={() => void load()}>
            Refresh
          </button>
        </div>

        {loading ? <p className="cms-muted">Loading…</p> : null}
        {error ? <p className="cms-muted">Error: {error}</p> : null}

        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Token</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Patient</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Phone</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Slot</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Status</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{q.tokenNumber}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{q.appointment?.patient?.name ?? "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{q.appointment?.patient?.phone ?? "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{q.appointment?.timeSlot ?? "-"}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{q.status}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    {q.status === "waiting" ? (
                      <div className="cms-row" style={{ marginTop: 0 }}>
                        <button
                          className="cms-btn cms-btn-secondary"
                          type="button"
                          disabled={updatingId === q.id}
                          onClick={() => void updateStatus(q.id, "in-progress")}
                        >
                          In-progress
                        </button>
                        <button
                          className="cms-btn cms-btn-secondary"
                          type="button"
                          disabled={updatingId === q.id}
                          onClick={() => void updateStatus(q.id, "skipped")}
                        >
                          Skipped
                        </button>
                      </div>
                    ) : null}

                    {q.status === "in_progress" ? (
                      <button
                        className="cms-btn cms-btn-secondary"
                        type="button"
                        disabled={updatingId === q.id}
                        onClick={() => void updateStatus(q.id, "done")}
                      >
                        Done
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}


