import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { getAdminAuthHeaders, ORDERS_API_URL, resolveImageUrl } from "../../utils/api";
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

const formatAddress = (address) => {
  if (!address) {
    return "N/A";
  }

  if (typeof address === "string") {
    return address;
  }

  if (typeof address === "object") {
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ]
      .map((part) => String(part || "").trim())
      .filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  }

  return "N/A";
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "Rs 0.00";
  }

  return `Rs ${amount.toFixed(2)}`;
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
          prev.map((item) => {
            const itemId = item.id || item._id;
            return String(itemId) === String(orderId) ? updatedOrder : item;
          })
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
          <p>Track customer orders and update each order status from one place.</p>
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

                {orders.map((order) => {
                  const orderId = order.id || order._id;

                  return (
                    <React.Fragment key={String(orderId)}>
                      <tr>
                      <td data-label="Order">
                        <div className="admin-order-cell">
                          <strong>{order.orderNumber || `#${orderId}`}</strong>
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
                      <td data-label="Total">{formatCurrency(order.total)}</td>
                      <td data-label="Payment">
                        <span style={{ textTransform: "capitalize" }}>
                          {order.payment?.method || order.payment?.gateway || "—"}
                        </span>
                      </td>
                      <td data-label="Status">
                        <select
                          className="admin-status-select"
                          value={order.status || "pending"}
                          onChange={(event) => updateOrderStatus(orderId, event.target.value)}
                          disabled={statusSavingId === String(orderId)}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Created">{formatDate(order.date || order.createdAt)}</td>
                      <td data-label="Details">
                        <button
                          className="admin-expand-btn"
                          onClick={() => toggleExpand(orderId)}
                        >
                          {expandedId === orderId ? "Hide" : "View"}
                        </button>
                      </td>
                      </tr>

                      {expandedId === orderId && (
                        <tr className="admin-order-details-row">
                          <td colSpan={9} className="admin-order-details-cell">
                            <div className="admin-order-details-grid">
                              <div className="admin-order-details-card">
                                <h4>Customer Info</h4>
                                <p><strong>Name:</strong> {order.customer || "N/A"}</p>
                                <p><strong>Phone:</strong> {order.phone || "N/A"}</p>
                                <p><strong>Email:</strong> {order.email || "N/A"}</p>
                                <p><strong>Address:</strong> {formatAddress(order.shippingAddress)}</p>
                              </div>
                              <div className="admin-order-details-card">
                                <h4>Payment Info</h4>
                                <p><strong>Gateway:</strong> {order.payment?.gateway || "N/A"}</p>
                                <p><strong>Method:</strong> {order.payment?.method || "N/A"}</p>
                                <p><strong>Amount:</strong> {formatCurrency(order.payment?.amount || order.total)}</p>
                                <p><strong>Status:</strong> {order.payment?.status || "N/A"}</p>
                                <p><strong>Payment ID:</strong> {order.payment?.razorpayPaymentId || "N/A"}</p>
                                <p><strong>Paid At:</strong> {order.payment?.paidAt ? formatDate(order.payment.paidAt) : "N/A"}</p>
                              </div>
                            </div>

                            <div className="admin-order-items-section">
                              <h4>Ordered Items</h4>
                              <div className="admin-order-items-grid">
                                {Array.isArray(order.items) && order.items.map((item, idx) => (
                                  <div key={idx} className="admin-order-item-card">
                                    {item.image && (
                                      <img
                                        src={resolveImageUrl(item.image)}
                                        alt={item.name}
                                        className="admin-order-item-image"
                                      />
                                    )}
                                    <div>
                                      <p className="admin-order-item-name">{item.name}</p>
                                      <p className="admin-order-item-meta">
                                        {item.size && `Size: ${item.size}`}
                                        {item.color && ` | Color: ${item.color}`}
                                      </p>
                                      <p className="admin-order-item-price">
                                        Qty: {item.quantity}
                                        {item.chargedQuantity != null && ` | Charged: ${item.chargedQuantity}`}
                                        {item.lineTotal != null && ` | ${formatCurrency(item.lineTotal)}`}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
