import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  API_BASE_URL,
  setAdminSession,
} from "../../utils/api";
import "./Admin.css";

// Admin Login Page Component
function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", rememberMe: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Debug: Log form state on change
  React.useEffect(() => {
    console.log("[AdminLogin] Form state:", form);
  }, [form]);

  // Debug: Log API base URL
  React.useEffect(() => {
    console.log("[AdminLogin] API_BASE_URL:", API_BASE_URL);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Debug: Log field change
    console.log(`[AdminLogin] Changed field: ${name} =>`, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setSubmitting(true);
    setError("");

    const username = form.username.trim();
    const password = form.password.trim();

    console.log("[AdminLogin] Submitting login:", { username, password, rememberMe: form.rememberMe });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username,
        password,
        rememberMe: form.rememberMe,
      });
      console.log("[AdminLogin] Login response:", response.data);

      setAdminSession({
        token: response.data.token,
        role: response.data.role,
        expiresAt: response.data.expiresAt,
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("[AdminLogin] Login error:", err);
      if (!err.response) {
        setError("Cannot reach backend server. Start backend and try again.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p>Sign in to manage products and inventory.</p>

        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <label className="admin-remember-row">
          <input
            type="checkbox"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
          />
          Remember me (30 days)
        </label>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="admin-submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
