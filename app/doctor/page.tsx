"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "../components/auth-gate";
import AppShell from "../components/app-shell";
import { cmsFetchJson, CmsApiError } from "../lib/cms-client";

type DoctorQueueItem = {
  id: number;
  tokenNumber: number;
  status: string;
  patientName: string;
  patientId: number;
  appointmentId: number;
};

type Medicine = { name: string; dosage: string; duration: string };

type AddPrescriptionBody = {
  medicines: Medicine[];
  notes?: string;
};

type AddReportBody = {
  diagnosis: string;
  testRecommended?: string;
  remarks?: string;
};

export default function DoctorPage() {
  return (
    <AuthGate allow={["doctor"]} title="Doctor">
      {({ token }) => <Inner token={token} />}
    </AuthGate>
  );
}

function Inner({ token }: { token: string }) {
  const [items, setItems] = useState<DoctorQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [rxMedicines, setRxMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", duration: "" },
  ]);
  const [rxNotes, setRxNotes] = useState("");
  const [rxSubmitting, setRxSubmitting] = useState(false);

  const [repDiagnosis, setRepDiagnosis] = useState("");
  const [repTest, setRepTest] = useState("");
  const [repRemarks, setRepRemarks] = useState("");
  const [repSubmitting, setRepSubmitting] = useState(false);

  const canSubmitRx = useMemo(() => {
    return rxMedicines.length > 0 && rxMedicines.every((m) => m.name && m.dosage && m.duration);
  }, [rxMedicines]);

  const canSubmitReport = useMemo(() => {
    return repDiagnosis.trim().length > 0;
  }, [repDiagnosis]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await cmsFetchJson<DoctorQueueItem[]>("/doctor/queue", { token });
      setItems(list);
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to load doctor queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submitPrescription(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAppointmentId || !canSubmitRx || rxSubmitting) return;

    setRxSubmitting(true);
    setError(null);
    try {
      await cmsFetchJson(`/prescriptions/${selectedAppointmentId}`, {
        method: "POST",
        token,
        body: { medicines: rxMedicines, notes: rxNotes } satisfies AddPrescriptionBody,
      });
      await load();
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to add prescription");
    } finally {
      setRxSubmitting(false);
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAppointmentId || !canSubmitReport || repSubmitting) return;

    setRepSubmitting(true);
    setError(null);
    try {
      await cmsFetchJson(`/reports/${selectedAppointmentId}`, {
        method: "POST",
        token,
        body: {
          diagnosis: repDiagnosis,
          testRecommended: repTest || undefined,
          remarks: repRemarks || undefined,
        } satisfies AddReportBody,
      });
      await load();
    } catch (e) {
      setError(e instanceof CmsApiError ? e.message : "Failed to add report");
    } finally {
      setRepSubmitting(false);
    }
  }

  return (
    <AppShell title="Doctor Dashboard">

          {loading ? <p className="dash-muted">Loading…</p> : null}
          {error ? <p className="dash-muted">Error: {error}</p> : null}

          <div className="dash-tableWrap" style={{ marginTop: 8 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Appointment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q.id}>
                    <td>{q.tokenNumber}</td>
                    <td>{q.patientName}</td>
                    <td>{q.status}</td>
                    <td>{q.appointmentId}</td>
                    <td>
                      <button
                        className="dash-btn dash-btn-secondary"
                        type="button"
                        onClick={() => setSelectedAppointmentId(q.appointmentId)}
                      >
                        Add Report / Prescription
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedAppointmentId ? (
            <div style={{ marginTop: 18 }}>
              <h2 className="dash-h2">Appointment #{selectedAppointmentId}</h2>

              <div className="dash-grid" style={{ marginTop: 10 }}>
                <form className="dash-panel" onSubmit={submitPrescription}>
                  <h3 className="dash-h3">Prescription</h3>
                  {rxMedicines.map((m, idx) => (
                    <div key={idx} className="dash-row" style={{ marginTop: 10 }}>
                      <input
                        className="login-input"
                        placeholder="Medicine"
                        value={m.name}
                        onChange={(e) =>
                          setRxMedicines((arr) =>
                            arr.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)),
                          )
                        }
                      />
                      <input
                        className="login-input"
                        placeholder="Dosage"
                        value={m.dosage}
                        onChange={(e) =>
                          setRxMedicines((arr) =>
                            arr.map((x, i) => (i === idx ? { ...x, dosage: e.target.value } : x)),
                          )
                        }
                      />
                      <input
                        className="login-input"
                        placeholder="Duration"
                        value={m.duration}
                        onChange={(e) =>
                          setRxMedicines((arr) =>
                            arr.map((x, i) => (i === idx ? { ...x, duration: e.target.value } : x)),
                          )
                        }
                      />
                    </div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="login-input"
                      style={{ width: "min(720px, 100%)" }}
                      placeholder="Notes"
                      value={rxNotes}
                      onChange={(e) => setRxNotes(e.target.value)}
                    />
                  </div>

                  <div className="dash-row" style={{ marginTop: 10 }}>
                    <button className="dash-btn" disabled={!canSubmitRx || rxSubmitting}>
                      {rxSubmitting ? "Saving…" : "Save prescription"}
                    </button>
                  </div>
                </form>

                <form className="dash-panel" onSubmit={submitReport}>
                  <h3 className="dash-h3">Report</h3>
                  <div className="dash-row" style={{ marginTop: 10 }}>
                    <input
                      className="login-input"
                      style={{ width: "min(720px, 100%)" }}
                      placeholder="Diagnosis"
                      value={repDiagnosis}
                      onChange={(e) => setRepDiagnosis(e.target.value)}
                    />
                  </div>
                  <div className="dash-row" style={{ marginTop: 10 }}>
                    <input
                      className="login-input"
                      style={{ width: "min(720px, 100%)" }}
                      placeholder="Test recommended"
                      value={repTest}
                      onChange={(e) => setRepTest(e.target.value)}
                    />
                  </div>
                  <div className="dash-row" style={{ marginTop: 10 }}>
                    <input
                      className="login-input"
                      style={{ width: "min(720px, 100%)" }}
                      placeholder="Remarks"
                      value={repRemarks}
                      onChange={(e) => setRepRemarks(e.target.value)}
                    />
                  </div>

                  <div className="dash-row" style={{ marginTop: 10 }}>
                    <button className="dash-btn" >
                      {repSubmitting ? "Saving…" : "Save report"}
                    </button>
                    <button
                      className="dash-btn dash-btn-secondary"
                      type="button"
                      onClick={() => setSelectedAppointmentId(null)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
    </AppShell>
  );
}




