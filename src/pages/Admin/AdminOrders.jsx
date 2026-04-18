import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { getAdminAuthHeaders, ORDERS_API_URL } from "../../utils/api";
import "./Admin.css";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value || "";
  }
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSavingId, setStatusSavingId] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ORDERS_API_URL, {
        headers: getAdminAuthHeaders(),
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setStatusSavingId(String(orderId));
      const response = await axios.patch(
        `${ORDERS_API_URL}/${orderId}/status`,
        { status },
        {
          headers: {
            ...getAdminAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      const updatedOrder = response.data?.order;

      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((item) => (String(item.id) === String(orderId) ? updatedOrder : item))
        );
      }
      setError("");
    } catch (err) {
      const fallbackMessage = err.message ? `Failed to update order status (${err.message})` : "Failed to update order status";
      setError(err.response?.data?.message || fallbackMessage);
    } finally {
      setStatusSavingId("");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-head">
          <h1>Orders</h1>
          <p>Track all customer orders and update lifecycle statuses from one panel.</p>
        </header>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-mobile-cards">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 && (
                  <tr className="admin-empty-row">
                    <td colSpan={6}>No orders yet.</td>
                  </tr>
                )}

                {orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order">
                      <div className="admin-order-cell">
                        <strong>{order.orderNumber || `#${order.id}`}</strong>
                        <span>{order.phone}</span>
                      </div>
                    </td>
                    <td data-label="Customer">
                      <div className="admin-order-cell">
                        <strong>{order.customer}</strong>
                        <span>{order.email || "No email"}</span>
                      </div>
                    </td>
                    <td data-label="Items">{Array.isArray(order.items) ? order.items.length : 0}</td>
                    <td data-label="Total">₹{order.total}</td>
                    <td data-label="Status">
                      <select
                        className="admin-status-select"
                        value={order.status || "pending"}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                        disabled={statusSavingId === String(order.id)}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Created">{formatDate(order.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
