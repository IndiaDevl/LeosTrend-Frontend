import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { ADMIN_STATS_API_URL, getAdminAuthHeaders, HEALTH_API_URL } from "../../utils/api";
import "./Admin.css";

function AdminDashboard() {
  const [selectedRange, setSelectedRange] = useState("all");
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [healthResponse, statsResponse] = await Promise.all([
          axios.get(HEALTH_API_URL),
          axios.get(ADMIN_STATS_API_URL, {
            headers: getAdminAuthHeaders(),
            params: { range: selectedRange },
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setHealth(healthResponse.data);
        setStats(statsResponse.data?.stats || null);
        setStatsError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!health) {
          setHealth(null);
        }

        setStats(null);
        setStatsError(error.response?.data?.message || "Failed to load dashboard statistics");
      } finally {
        if (isMounted) {
          setHealthLoading(false);
          setStatsLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, [selectedRange]);

  const isFallbackStorage = health?.orderPersistence === "fallback-file";
  const dbLabel  = healthLoading ? "Checking…" : health ? (isFallbackStorage ? "Fallback File (temporary)" : "Database (connected)") : "Unreachable";
  const dbDot    = healthLoading ? "db-dot-checking" : health ? (isFallbackStorage ? "db-dot-warn" : "db-dot-ok") : "db-dot-err";
  const totalOrders = Number(stats?.totalOrders || 0);
  const totalRevenue = Number(stats?.totalRevenue || 0);
  const averageOrderValue = Number(stats?.averageOrderValue || 0);
  const statusCounts = stats?.statusCounts || {};
  const statusPercentages = stats?.statusPercentages || {};
  const recentOrders = Array.isArray(stats?.recentOrders) ? stats.recentOrders : [];

  const rangeLabelMap = {
    all: "All Time",
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-head">
          <h1>Admin Dashboard</h1>
          <p>Manage the storefront inventory and keep products updated in real time.</p>
        </header>

        {/* System status strip */}
        <div className="admin-status-strip">
          <div className="admin-status-item">
            <span className={`admin-db-dot ${dbDot}`}></span>
            <span className="admin-status-label">Database</span>
            <span className="admin-status-value">{dbLabel}</span>
          </div>
          <div className="admin-status-item">
            <span className="admin-status-label">Order Storage</span>
            <span className="admin-status-value">
              {healthLoading ? "Checking…" : health ? health.orderPersistence : "—"}
            </span>
          </div>
          <div className="admin-status-item">
            <span className="admin-status-label">Backend Port</span>
            <span className="admin-status-value">{health ? "1000 — online" : "offline"}</span>
          </div>
          {isFallbackStorage && (
            <div className="admin-status-item admin-status-warn-text">
              Orders are now stored in MySQL and remain available across backend restarts.
            </div>
          )}
        </div>

        <section className="admin-stats-grid">
          <article className="admin-stat-card admin-stat-card-wide admin-stats-toolbar-card">
            <div className="admin-stat-header-row admin-stats-toolbar">
              <div>
                <p className="admin-stat-label">Stats Window</p>
                <h2>{rangeLabelMap[selectedRange]}</h2>
              </div>

              <label className="admin-range-control">
                <span>Filter Range</span>
                <select value={selectedRange} onChange={(event) => setSelectedRange(event.target.value)}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </label>
            </div>
          </article>

          <article className="admin-stat-card">
            <p className="admin-stat-label">Total Orders</p>
            <h2>{statsLoading ? "..." : totalOrders}</h2>
            <span className="admin-stat-meta">Orders in the selected time window</span>
          </article>

          <article className="admin-stat-card">
            <p className="admin-stat-label">Total Revenue</p>
            <h2>{statsLoading ? "..." : `Rs ${totalRevenue.toFixed(2)}`}</h2>
            <span className="admin-stat-meta">Revenue in the selected time window</span>
          </article>

          <article className="admin-stat-card">
            <p className="admin-stat-label">Average Order Value</p>
            <h2>{statsLoading ? "..." : `Rs ${averageOrderValue.toFixed(2)}`}</h2>
            <span className="admin-stat-meta">Mean revenue per order in this range</span>
          </article>

          <article className="admin-stat-card admin-stat-card-wide">
            <div className="admin-stat-header-row">
              <div>
                <p className="admin-stat-label">Order Status Breakdown</p>
                <h2>{statsLoading ? "..." : Object.keys(statusCounts).length}</h2>
              </div>
              <span className="admin-stat-meta">Grouped with SQL `COUNT(*)`</span>
            </div>

            <div className="admin-status-counts">
              {statsLoading && <span className="admin-status-pill">Loading...</span>}
              {!statsLoading && Object.keys(statusCounts).length === 0 && (
                <span className="admin-status-pill">No orders yet</span>
              )}
              {!statsLoading && Object.entries(statusCounts).map(([status, count]) => (
                <span key={status} className="admin-status-pill">
                  <strong>{status}</strong>
                  <em>{count}</em>
                </span>
              ))}
            </div>

            {!statsLoading && Object.keys(statusCounts).length > 0 && (
              <div className="admin-status-meter-list">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="admin-status-meter-row">
                    <div className="admin-status-meter-head">
                      <strong>{status}</strong>
                      <span>{count} orders</span>
                      <em>{Number(statusPercentages[status] || 0).toFixed(1)}%</em>
                    </div>
                    <div className="admin-status-meter-track">
                      <span
                        className="admin-status-meter-fill"
                        style={{ width: `${Math.min(100, Number(statusPercentages[status] || 0))}%` }}
                      ></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="admin-stat-card admin-stat-card-wide">
            <div className="admin-stat-header-row">
              <div>
                <p className="admin-stat-label">Recent Orders</p>
                <h2>{statsLoading ? "..." : recentOrders.length}</h2>
              </div>
              <span className="admin-stat-meta">Latest 5 orders, newest first</span>
            </div>

            {statsError && <p className="admin-stats-error">{statsError}</p>}

            {!statsError && (
              <div className="admin-recent-orders">
                {statsLoading && <p className="admin-stat-empty">Loading recent orders...</p>}
                {!statsLoading && recentOrders.length === 0 && (
                  <p className="admin-stat-empty">No recent orders found.</p>
                )}
                {!statsLoading && recentOrders.map((order) => (
                  <div key={order.id} className="admin-recent-order-row">
                    <div>
                      <strong>{order.orderNumber || `#${order.id}`}</strong>
                      <span>{order.customer || "Unknown customer"}</span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <strong>{order.status}</strong>
                      <span>Order ID: {order.id}</span>
                      <span>Rs {Number(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="admin-cards">
          <article className="admin-card">
            <h3>Add New Product</h3>
            <p>Create a new listing with details, stock, and image.</p>
            <Link to="/admin/add-product" className="admin-card-link">
              Go to Add Product
            </Link>
          </article>

          <article className="admin-card">
            <h3>Manage Existing Products</h3>
            <p>Edit pricing, stock, and remove old inventory.</p>
            <Link to="/admin/manage-products" className="admin-card-link">
              Go to Manage Products
            </Link>
          </article>

          <article className="admin-card">
            <h3>Manage Orders</h3>
            <p>Review new purchases and update status from pending to delivered.</p>
            <Link to="/admin/orders" className="admin-card-link">
              Go to Orders
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
