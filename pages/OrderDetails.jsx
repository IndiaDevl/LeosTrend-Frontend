import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ORDERS_API_URL } from "../utils/api";
import "./OrderDetails.css";

const ORDER_CACHE_STORAGE_KEY = "leostrend_orders_cache";

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

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${ORDERS_API_URL}/${id}`);
        setOrder(response.data);
      } catch (err) {
        const cachedOrders = JSON.parse(localStorage.getItem(ORDER_CACHE_STORAGE_KEY) || "[]");
        const cachedOrder = Array.isArray(cachedOrders)
          ? cachedOrders.find((item) => String(item.id) === String(id))
          : null;

        if (cachedOrder) {
          setOrder(cachedOrder);
          return;
        }

        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <section className="order-details-page">
        <div className="container order-details-shell">
          <p>Loading order details...</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="order-details-page">
        <div className="container order-details-shell">
          <div className="order-details-empty">
            <h2>Order not found</h2>
            <p>{error || "We could not find this order."}</p>
            <Link to="/orders" className="order-details-btn">Back to Orders</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-details-page">
      <div className="container order-details-shell">
        <nav className="order-details-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/orders">Orders</Link>
          <span>/</span>
          <span>{order.orderNumber || `#${order.id}`}</span>
        </nav>

        <header className="order-details-head">
          <div>
            <p className="order-details-kicker">Order Details</p>
            <h1>{order.orderNumber || `#${order.id}`}</h1>
            <p>Placed on {formatDate(order.date)}</p>
          </div>
          <span className={`order-status status-${order.status || "pending"}`}>
            {(order.status || "pending").toUpperCase()}
          </span>
        </header>

        <div className="order-details-grid">
          <section className="order-panel">
            <h3>Items</h3>
            <div className="order-items">
              {(order.items || []).map((item, index) => (
                <article key={`${order.id}-${item.name}-${index}`} className="order-item-row">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>Size: {item.size || "M"}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <strong>₹{item.price * item.quantity}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="order-panel">
            <h3>Summary</h3>
            <p><strong>Customer:</strong> {order.customer}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <p><strong>Email:</strong> {order.email || "N/A"}</p>
            <p><strong>Address:</strong> {order.shippingAddress || "N/A"}</p>

            <div className="order-total-row">
              <span>Total</span>
              <strong>₹{order.total}</strong>
            </div>
          </section>
        </div>

        <section className="order-panel order-timeline">
          <h3>Status Timeline</h3>
          {(order.statusTimeline || []).map((entry, index) => (
            <div key={`${entry.status}-${index}`} className="timeline-row">
              <span className={`timeline-dot status-${entry.status || "pending"}`} />
              <div>
                <p>{String(entry.status || "pending").toUpperCase()}</p>
                <small>{formatDate(entry.updatedAt)}</small>
              </div>
            </div>
          ))}
        </section>

        <Link to="/orders" className="order-details-btn">Back to Orders</Link>
      </div>
    </section>
  );
}

export default OrderDetails;
