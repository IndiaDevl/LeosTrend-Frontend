import React, { useState } from "react";
import axios from "axios";
import { ORDERS_API_URL } from "../utils/api";

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

function Orders() {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await axios.get(`${ORDERS_API_URL.replace("/api/orders", "/api/order-lookup")}/${orderCode}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <h2>Order Lookup</h2>
      <form onSubmit={handleLookup} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={orderCode}
          onChange={e => setOrderCode(e.target.value)}
          placeholder="Enter your order code (e.g. LT-12345678)"
          style={{ padding: 8, fontSize: 16, width: 240 }}
          required
        />
        <button type="submit" style={{ marginLeft: 12, padding: '8px 16px', fontSize: 16 }} disabled={loading}>
          {loading ? "Looking up..." : "View Order"}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {order && (
        <div className="order-details" style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
          <h3>Order #{order.orderNumber}</h3>
          <p><b>Date:</b> {formatDate(order.createdAt || order.date)}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total}</p>
          <p><b>Customer:</b> {order.customer}</p>
          <p><b>Email:</b> {order.email}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <div>
            <b>Items:</b>
            <ul>
              {(order.items || []).map((item, idx) => (
                <li key={idx}>{item.name} x {item.quantity} (₹{item.price})</li>
              ))}
            </ul>
          </div>
          {order.shippingAddress && (
            <div>
              <b>Shipping Address:</b>
              <div>{order.shippingAddress}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;
