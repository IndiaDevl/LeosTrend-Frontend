import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ORDERS_API_URL } from "../utils/api";
import "./Orders.css";

const ORDER_HISTORY_STORAGE_KEY = "leostrend_order_ids";
const ORDER_CONTACT_STORAGE_KEY = "leostrend_order_contact";
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

const sortOrdersDesc = (items = []) => [...items].sort((a, b) => Number(b.id) - Number(a.id));

const updateOrderCache = (orders) => {
  if (Array.isArray(orders) && orders.length > 0) {
    localStorage.setItem(
      ORDER_HISTORY_STORAGE_KEY,
      JSON.stringify(orders.map((order) => order.id).slice(0, 50))
    );
    localStorage.setItem(ORDER_CACHE_STORAGE_KEY, JSON.stringify(orders));
    return;
  }

  localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
  localStorage.removeItem(ORDER_CACHE_STORAGE_KEY);
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showingCachedOrders, setShowingCachedOrders] = useState(false);
  const [lookup, setLookup] = useState({ phone: "", email: "" });
  // Local state for lookup fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const fetchOrdersByLookup = async ({ phone, email }) => {
    const params = {};
    if (String(phone || "").trim()) params.phone = String(phone).trim();
    if (String(email || "").trim()) params.email = String(email).trim();

    const response = await axios.get(ORDERS_API_URL, { params });
    const fetchedOrders = sortOrdersDesc(Array.isArray(response.data) ? response.data : []);

    setOrders(fetchedOrders);
    localStorage.setItem(
      ORDER_CONTACT_STORAGE_KEY,
      JSON.stringify({
        phone: params.phone || "",
        email: params.email || "",
      })
    );
    updateOrderCache(fetchedOrders);

    return fetchedOrders;
  };

  const loadOrders = async ({ forceLookup = false, showSpinner = true } = {}) => {
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");
    setShowingCachedOrders(false);

    const cachedOrders = JSON.parse(localStorage.getItem(ORDER_CACHE_STORAGE_KEY) || "[]");

    try {
      const storedIds = JSON.parse(localStorage.getItem(ORDER_HISTORY_STORAGE_KEY) || "[]");
      const contact = JSON.parse(localStorage.getItem(ORDER_CONTACT_STORAGE_KEY) || "{}");
      const activeLookup = forceLookup
        ? {
            phone: String(lookup.phone || "").trim(),
            email: String(lookup.email || "").trim(),
          }
        : {
            phone: contact.phone || String(lookup.phone || "").trim(),
            email: contact.email || String(lookup.email || "").trim(),
          };

      setLookup(activeLookup);

      let fetchedOrders = [];

      if (!forceLookup && Array.isArray(storedIds) && storedIds.length > 0) {
        const responses = await Promise.all(
          storedIds.map(async (id) => {
            try {
              const response = await axios.get(`${ORDERS_API_URL}/${id}`);
              return response.data;
            } catch {
              return null;
            }
          })
        );

        fetchedOrders = responses.filter(Boolean);
      }

      if (fetchedOrders.length === 0 && (activeLookup.phone || activeLookup.email)) {
        fetchedOrders = await fetchOrdersByLookup(activeLookup);
      }

      fetchedOrders = sortOrdersDesc(fetchedOrders);
      setOrders(fetchedOrders);
      updateOrderCache(fetchedOrders);
    } catch (err) {
      if (Array.isArray(cachedOrders) && cachedOrders.length > 0) {
        setOrders(sortOrdersDesc(cachedOrders));
        setShowingCachedOrders(true);
      } else {
        setOrders([]);
        setError(err.response?.data?.message || "Failed to load orders");
      }
    } finally {
      if (showSpinner) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleLookupSubmit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setLookup({ phone, email });
    await loadOrders({ forceLookup: true, showSpinner: true });
  };

  const handleRefresh = async () => {
    await loadOrders({ forceLookup: true, showSpinner: false });
  };

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <section className="orders-page">
      <div className="container orders-shell">
        <header className="orders-head">
          <div>
            <p className="orders-kicker">Order History</p>
            <h1>My Orders</h1>
            <p>Track all your purchases, order statuses, and delivery progress in one place.</p>
          </div>
          <button
            className="orders-refresh-btn"
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh From Server"}
          </button>
        </header>

        <form className="orders-lookup" onSubmit={handleLookupSubmit}>
          <div className="orders-lookup-field">
            <label htmlFor="orders-phone">Phone Number</label>
            <input
              id="orders-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter phone used during checkout"
              autoComplete="off"
            />
          </div>

          <div className="orders-lookup-field">
            <label htmlFor="orders-email">Email Address</label>
            <input
              id="orders-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email used during checkout"
              autoComplete="off"
            />
          </div>

          <button className="orders-btn orders-lookup-submit-row" type="submit" disabled={loading || refreshing}>
            {loading ? "Searching..." : "Find My Orders"}
          </button>
        </form>

        {loading && <p className="orders-note">Loading orders...</p>}
        {!loading && error && <p className="orders-error">{error}</p>}
        {showingCachedOrders && !loading && (
          <p className="orders-cache-note">
            Live order data could not be loaded, so these results are from your browser cache only.
          </p>
        )}

        {!loading && !hasOrders && !showingCachedOrders && !error && (
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>Your placed orders will show up here with status tracking.</p>
            <Link className="orders-btn" to="/collection/oversized">Start Shopping</Link>
          </div>
        )}

        {!loading && hasOrders && (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-top">
                  <div>
                    <p className="order-id">{order.orderNumber || `#${order.id}`}</p>
                    <p className="order-date">Placed on {formatDate(order.date)}</p>
                  </div>
                  <span className={`order-status status-${order.status || "pending"}`}>
                    {(order.status || "pending").toUpperCase()}
                  </span>
                </div>

                <div className="order-meta-grid">
                  <p><strong>Customer:</strong> {order.customer}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Items:</strong> {Array.isArray(order.items) ? order.items.length : 0}</p>
                  <p><strong>Total:</strong> Rs {order.total}</p>
                </div>

                <div className="order-preview-items">
                  {(order.items || []).slice(0, 3).map((item, index) => (
                    <span key={`${order.id}-${item.name}-${index}`}>
                      {item.name} x {item.quantity}
                    </span>
                  ))}
                </div>

                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="orders-btn">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
