import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  API_BASE_URL,
  HEALTH_API_URL,
  clearAdminSession,
  getAdminAuthHeaders,
} from "../utils/api";

function AdminSidebar() {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState(null);
  const isTemporaryStorage = systemStatus?.orderPersistence === "fallback-file";

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const response = await axios.get(HEALTH_API_URL);
        if (isMounted) {
          setSystemStatus(response.data || null);
        }
      } catch {
        if (isMounted) {
          setSystemStatus(null);
        }
      }
    };

    loadStatus();
    const intervalId = window.setInterval(loadStatus, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/logout`, null, {
        headers: getAdminAuthHeaders(),
      });
    } catch {
      // Session cleanup still proceeds even if API logout fails.
    }

    clearAdminSession();
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <h2 className="admin-logo">LeosTrend Admin</h2>

      {isTemporaryStorage && (
        <div className="admin-system-alert" role="status">
          <strong>Temporary Mode</strong>
          <span>Orders are now persisted in MySQL. Use this panel to monitor and update live order data.</span>
        </div>
      )}

      <nav className="admin-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-link ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/add-product"
          className={({ isActive }) =>
            `admin-link ${isActive ? "active" : ""}`
          }
        >
          Add Product
        </NavLink>

        <NavLink
          to="/admin/manage-products"
          className={({ isActive }) =>
            `admin-link ${isActive ? "active" : ""}`
          }
        >
          Manage Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `admin-link ${isActive ? "active" : ""}`
          }
        >
          Orders
        </NavLink>
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;
