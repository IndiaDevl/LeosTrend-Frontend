import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { API_BASE_URL, getAdminAuthHeaders } from "../../utils/api";
import "./Admin.css";

const BOGO_API_URL = `${API_BASE_URL}/api/admin/bogo-offer`;

const DEFAULT_TITLE = "Buy 1 Get 1 Free";
const DEFAULT_SUBTITLE = "Buy any 2 items and 1 item becomes free automatically";

const pad = (value) => String(value).padStart(2, "0");

const toLocalDatetimeInput = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toLocalDateInput = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toLocalTimeInput = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildIsoFromParts = (datePart, timePart) => {
  if (!datePart || !timePart) return "";

  const candidate = new Date(`${datePart}T${timePart}:00`);
  return Number.isNaN(candidate.getTime()) ? "" : candidate.toISOString();
};

function AdminBogo() {
  const [form, setForm] = useState({
    is_active: false,
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    end_date: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    axios
      .get(BOGO_API_URL, { headers: getAdminAuthHeaders() })
      .then((res) => {
        if (!mounted) return;
        const d = res.data;
        const loadedEndTime = d.end_time ? toLocalDatetimeInput(d.end_time) : "";
        setForm({
          is_active: Boolean(d.is_active),
          title: d.title || DEFAULT_TITLE,
          subtitle: d.subtitle || DEFAULT_SUBTITLE,
          end_date: d.end_time ? toLocalDateInput(d.end_time) : "",
          end_time: d.end_time ? toLocalTimeInput(d.end_time) : "",
        });
        if (loadedEndTime) {
          setMessage("");
        }
      })
      .catch(() => {
        if (mounted) setError("Failed to load offer settings.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage("");
    setError("");
  };

  const handleQuickDuration = (days) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    setForm((prev) => ({
      ...prev,
      end_date: `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}`,
      end_time: `${pad(nextDate.getHours())}:${pad(nextDate.getMinutes())}`,
    }));
    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    const endTimeIso = buildIsoFromParts(form.end_date, form.end_time);
    if (form.is_active && !endTimeIso) {
      setError("Add a valid end date and time, or turn the offer off.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        is_active: form.is_active ? 1 : 0,
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        end_time: endTimeIso || null,
      };
      await axios.put(BOGO_API_URL, payload, { headers: getAdminAuthHeaders() });
      setMessage("Offer settings saved and published successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save offer settings.");
    } finally {
      setSaving(false);
    }
  };

  const endTimeIso = useMemo(() => buildIsoFromParts(form.end_date, form.end_time), [form.end_date, form.end_time]);
  const now = Date.now();
  const endTimeValue = endTimeIso ? new Date(endTimeIso).getTime() : 0;
  const isExpired = Boolean(endTimeIso && endTimeValue < now);
  const hasSchedule = Boolean(endTimeIso);
  const isCurrentlyActive = Boolean(form.is_active && (!hasSchedule || !isExpired));
  const statusLabel = !form.is_active
    ? "Paused"
    : isExpired
      ? "Expired"
      : hasSchedule
        ? "Scheduled"
        : "Active";

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="admin-head">
          <h1>Sale Offer Settings</h1>
          <p>Control the limited-time homepage sale shown to first-time visitors and returning shoppers.</p>
        </div>

        <div className="admin-status-strip">
          <div className="admin-status-item">
            <span className={`admin-db-dot ${isCurrentlyActive ? "db-dot-ok" : isExpired ? "db-dot-err" : "db-dot-warn"}`} />
            <span className="admin-status-label">Status</span>
            <span className="admin-status-value">{statusLabel}</span>
          </div>
          <div className="admin-status-item">
            <span className="admin-status-label">Homepage banner</span>
            <span className="admin-status-value">{isCurrentlyActive ? "Visible" : "Hidden"}</span>
          </div>
          <div className="admin-status-item">
            <span className="admin-status-label">Popup</span>
            <span className="admin-status-value">{isCurrentlyActive ? "Enabled once per session" : "Disabled"}</span>
          </div>
          <div className="admin-status-item">
            <span className="admin-status-label">End time</span>
            <span className="admin-status-value">{hasSchedule ? new Date(endTimeIso).toLocaleString() : "No expiry set"}</span>
          </div>
          {isExpired && (
            <div className="admin-status-warn-text">
              The configured end time has already passed. Save a future time or disable the sale.
            </div>
          )}
        </div>

        {loading ? (
          <div className="admin-card" style={{ marginTop: 24 }}>Loading offer settings…</div>
        ) : (
          <div className="admin-bogo-layout">
            <form className="admin-form admin-bogo-form" onSubmit={handleSave}>
              <div className="admin-bogo-toggle-row full-width">
                <label className="admin-bogo-switch">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <span className="admin-bogo-switch-track" />
                  <span className="admin-bogo-switch-copy">
                    <strong>{form.is_active ? "Offer published" : "Offer paused"}</strong>
                    <span>{form.is_active ? "Visible on the homepage while the schedule is valid" : "Saved, but hidden from customers"}</span>
                  </span>
                </label>
                <div className="admin-bogo-chip">{statusLabel}</div>
              </div>

              <label className="full-width">
                Offer title
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder={DEFAULT_TITLE}
                  required
                />
              </label>

              <label className="full-width">
                Supporting copy
                <textarea
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder={DEFAULT_SUBTITLE}
                  rows="3"
                />
              </label>

              <div className="admin-bogo-time-grid full-width">
                <label>
                  End date
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  End time
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="admin-bogo-presets full-width">
                <span className="admin-bogo-presets-label">Quick schedule</span>
                <div className="admin-bogo-preset-buttons">
                  <button type="button" className="admin-bogo-preset" onClick={() => handleQuickDuration(1)}>24 hours</button>
                  <button type="button" className="admin-bogo-preset" onClick={() => handleQuickDuration(3)}>3 days</button>
                  <button type="button" className="admin-bogo-preset" onClick={() => handleQuickDuration(7)}>7 days</button>
                </div>
              </div>

              {message && <p className="admin-success-msg full-width">{message}</p>}
              {error && <p className="admin-error-msg full-width">{error}</p>}

              <div className="admin-form-actions full-width">
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save and publish"}
                </button>
              </div>
            </form>

            <aside className="admin-bogo-preview">
              <div className="admin-card">
                <h3 style={{ marginTop: 0 }}>Homepage preview</h3>
                <div className="bogo-preview-card">
                  <span className="bogo-preview-tag">Limited offer</span>
                  <h4>{form.title || DEFAULT_TITLE}</h4>
                  <p>{form.subtitle || DEFAULT_SUBTITLE}</p>
                  <div className="bogo-preview-footer">
                    <span>{hasSchedule ? `Ends ${new Date(endTimeIso).toLocaleString()}` : "No expiry set"}</span>
                    <span>Shown only on Home</span>
                  </div>
                </div>
              </div>

              <div className="admin-card admin-bogo-notes">
                <h3 style={{ marginTop: 0 }}>Behavior</h3>
                <ul>
                  <li>The popup appears once per browser session when a visitor lands on the homepage.</li>
                  <li>The banner stays visible under the hero section while the sale is active.</li>
                  <li>When the end time passes, the sale hides automatically.</li>
                  <li>Turning the toggle off keeps the saved settings but closes the sale immediately.</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminBogo;
