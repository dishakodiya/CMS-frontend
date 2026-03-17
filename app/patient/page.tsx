"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../components/auth-gate";
import AppShell from "../components/app-shell";
import { cmsFetchJson, CmsApiError } from "../lib/cms-client";

type QueueEntry = {
  id: number;
  tokenNumber: number;
  status: "waiting" | "in_progress" | "done" | "skipped";
  queueDate: string;
  appointmentId: number;
  clinicId: number;
  createdAt: string;
};

type Appointment = {
  id: number;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  patientId: number;
  clinicId: number;
  createdAt: string;
  queueEntry: QueueEntry;
};

type BookAppointmentBody = {
  appointmentDate: string;
  timeSlot: string;
};

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PatientPage() {
  return (
    <AuthGate allow={["patient"]} title="Patient">
      {({ token }) => <PatientInner token={token} />}
    </AuthGate>
  );
}

function PatientInner({ token }: { token: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointmentDate, setAppointmentDate] = useState(todayYYYYMMDD());
  const [timeSlot, setTimeSlot] = useState("10:00-10:15");
  const [booking, setBooking] = useState(false);

  const canBook = useMemo(() => {
    return appointmentDate.trim().length === 10 && timeSlot.trim().length > 0;
  }, [appointmentDate, timeSlot]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await cmsFetchJson<Appointment[]>("/appointments/my", { token });
      setAppointments(list);
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    if (!canBook || booking) return;

    setBooking(true);
    setError(null);
    try {
      await cmsFetchJson<Appointment>("/appointments", {
        method: "POST",
        token,
        body: { appointmentDate, timeSlot } satisfies BookAppointmentBody,
      });
      await load();
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  }

  return (
    <AppShell title="Patient Dashboard">
      <div className="dash-panel">
        <h1 className="dash-h2">Patient Dashboard</h1>

        <h2 className="dash-h2" style={{ marginTop: 16 }}>Book appointment</h2>
        <form className="cms-row" onSubmit={onBook}>
          <input
            className="login-input"
            type="date"
            value={appointmentDate}
            min={todayYYYYMMDD()}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
          <input
            className="login-input"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            placeholder="10:00-10:15"
          />
          <button className="cms-btn" disabled={!canBook || booking}>
            {booking ? "Booking…" : "Book"}
          </button>
        </form>

        {loading ? <p className="cms-muted" style={{ marginTop: 12 }}>Loading…</p> : null}
        {error ? <p className="cms-muted" style={{ marginTop: 12 }}>Error: {error}</p> : null}

        <div style={{ marginTop: 18 }}>
          <h2 className="dash-h2">My appointments</h2>
          {appointments.length === 0 && !loading ? (
            <p className="cms-muted">No appointments yet.</p>
          ) : null}
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>ID</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Date</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Slot</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>Token</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(0,0,0,0.08)" }}></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{a.id}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{a.appointmentDate.slice(0, 10)}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{a.timeSlot}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{a.status}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {a.queueEntry?.tokenNumber ?? "-"} ({a.queueEntry?.status ?? "-"})
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <Link className="cms-btn cms-btn-secondary" href={`/patient/appointments/${a.id}`}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}





