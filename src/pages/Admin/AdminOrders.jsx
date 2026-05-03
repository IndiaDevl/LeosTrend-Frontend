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

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ORDERS_API_URL, {
        headers: getAdminAuthHeaders(),
      });
      setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
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
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 && (
                  <tr className="admin-empty-row">
                    <td colSpan={9}>No orders yet.</td>
                  </tr>
                )}

                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td data-label="Order">
                        <div className="admin-order-cell">
                          <strong>{order.orderNumber || `#${order.id}`}</strong>
                        </div>
                      </td>
                      <td data-label="Customer">
                        <div className="admin-order-cell">
                          <strong>{order.customer}</strong>
                          <span>{order.email || "No email"}</span>
                        </div>
                      </td>
                      <td data-label="Phone">{order.phone}</td>
                      <td data-label="Items">{Array.isArray(order.items) ? order.items.length : 0}</td>
                      <td data-label="Total">₹{order.total}</td>
                      <td data-label="Payment">
                        <span style={{ textTransform: "capitalize" }}>
                          {order.payment?.method || order.payment?.gateway || "—"}
                        </span>
                      </td>
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
                      <td>
                        <button
                          className="admin-expand-btn"
                          onClick={() => toggleExpand(order.id)}
                          style={{
                            background: "none",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          {expandedId === order.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {expandedId === order.id && (
                      <tr>
                        <td colSpan={9} style={{ background: "#f9fafb", padding: 16 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
                            <div>
                              <h4 style={{ margin: "0 0 8px" }}>Customer Info</h4>
                              <p style={{ margin: "2px 0" }}><strong>Name:</strong> {order.customer}</p>
                              <p style={{ margin: "2px 0" }}><strong>Phone:</strong> {order.phone}</p>
                              <p style={{ margin: "2px 0" }}><strong>Email:</strong> {order.email || "N/A"}</p>
                              <p style={{ margin: "2px 0" }}><strong>Address:</strong> {order.shippingAddress || "N/A"}</p>
                            </div>
                            <div>
                              <h4 style={{ margin: "0 0 8px" }}>Payment Info</h4>
                              <p style={{ margin: "2px 0" }}><strong>Gateway:</strong> {order.payment?.gateway || "N/A"}</p>
                              <p style={{ margin: "2px 0" }}><strong>Method:</strong> {order.payment?.method || "N/A"}</p>
                              <p style={{ margin: "2px 0" }}><strong>Amount:</strong> ₹{order.payment?.amount || order.total}</p>
                              <p style={{ margin: "2px 0" }}><strong>Status:</strong> {order.payment?.status || "N/A"}</p>
                              <p style={{ margin: "2px 0" }}><strong>Payment ID:</strong> {order.payment?.razorpayPaymentId || "N/A"}</p>
                              <p style={{ margin: "2px 0" }}><strong>Paid At:</strong> {order.payment?.paidAt ? formatDate(order.payment.paidAt) : "N/A"}</p>
                            </div>
                          </div>
                          <div style={{ marginTop: 16 }}>
                            <h4 style={{ margin: "0 0 8px" }}>Ordered Items</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                              {Array.isArray(order.items) && order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    background: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: 10,
                                    minWidth: 250,
                                  }}
                                >
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                                    />
                                  )}
                                  <div>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                                      {item.size && `Size: ${item.size}`}
                                      {item.color && ` | Color: ${item.color}`}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 13 }}>
                                      ₹{item.price} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
