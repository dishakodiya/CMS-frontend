"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../../../components/auth-gate";
import AppShell from "../../../components/app-shell";
import { cmsFetchJson, CmsApiError } from "../../../lib/cms-client";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
};

type Prescription = {
  id?: number;
  medicines?: Medicine[];
  notes?: string | null;
};

type Report = {
  id?: number;
  diagnosis?: string;
  testRecommended?: string | null;
  remarks?: string | null;
};

type AppointmentDetail = {
  id?: number;
  appointmentDate?: string;
  timeSlot?: string;
  status?: string;
  prescription?: Prescription | null;
  report?: Report | null;
  queueEntry?: {
    tokenNumber?: number;
    status?: string;
  };
};

export default function PatientAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AuthGate allow={["patient"]} title="Appointment details">
      {({ token }) => <Inner token={token} id={params.id} />}
    </AuthGate>
  );
}

function Inner({ token, id }: { token: string; id: string }) {
  const [data, setData] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await cmsFetchJson<AppointmentDetail>(
          `/appointments/${encodeURIComponent(id)}`,
          { token },
        );
        setData(res);
        return;
      } catch (e) {
        const err = e instanceof CmsApiError ? e : null;

        // Some backends expose patient details under `/appointments/my/:id`.
        if (err && (err.status === 403 || err.status === 404)) {
          try {
            const res2 = await cmsFetchJson<AppointmentDetail>(
              `/appointments/my/${encodeURIComponent(id)}`,
              { token },
            );
            setData(res2);
            return;
          } catch (e2) {
            const err2 = e2 instanceof CmsApiError ? e2 : null;
            setError(err2 ? `${err2.message} (${err2.status})` : "Failed to load appointment");
            return;
          }
        }

        setError(err ? `${err.message} (${err.status})` : "Failed to load appointment");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, token]);

  const dateText = useMemo(() => {
    const raw = data?.appointmentDate;
    return typeof raw === "string" && raw.length >= 10 ? raw.slice(0, 10) : "-";
  }, [data?.appointmentDate]);

  return (
    <AppShell title="Appointment Details">
      <div className="dash-panel">
        <div className="cms-row" style={{ justifyContent: "space-between" }}>
          <h1 className="cms-h1" style={{ marginBottom: 0 }}>
            Appointment #{id}
          </h1>
          <div className="cms-row" style={{ marginTop: 0 }}>
            <Link className="cms-btn cms-btn-secondary" href="/patient">
              Back
            </Link>
          </div>
        </div>

        {loading ? <p className="cms-muted">Loading…</p> : null}
        {error ? <p className="cms-muted">Error: {error}</p> : null}

        {data ? (
          <div style={{ marginTop: 12 }}>
            <p className="cms-muted">
              Date: <b>{dateText}</b> • Slot: <b>{data.timeSlot ?? "-"}</b> • Status: <b>{data.status ?? "-"}</b>
              {data.queueEntry?.tokenNumber ? (
                <>
                  {" "}• Token: <b>{data.queueEntry.tokenNumber}</b> ({data.queueEntry.status ?? "-"})
                </>
              ) : null}
            </p>

            <div style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 650 }}>Prescription</h2>
              {data.prescription ? (
                <div>
                  {Array.isArray(data.prescription.medicines) && data.prescription.medicines.length > 0 ? (
                    <ul style={{ marginLeft: 16, marginTop: 8 }}>
                      {data.prescription.medicines.map((m, idx) => (
                        <li key={idx}>
                          {m.name} — {m.dosage} — {m.duration}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cms-muted">No medicines yet.</p>
                  )}

                  {data.prescription.notes ? (
                    <p className="cms-muted" style={{ marginTop: 8 }}>
                      Notes: {data.prescription.notes}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="cms-muted">No prescription yet.</p>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 650 }}>Report</h2>
              {data.report ? (
                <div>
                  <p className="cms-muted" style={{ marginTop: 8 }}>
                    Diagnosis: <b>{data.report.diagnosis ?? "-"}</b>
                  </p>
                  {data.report.testRecommended ? (
                    <p className="cms-muted">Test: {data.report.testRecommended}</p>
                  ) : null}
                  {data.report.remarks ? <p className="cms-muted">Remarks: {data.report.remarks}</p> : null}
                </div>
              ) : (
                <p className="cms-muted">No report yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
