import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./OrderSuccess.css";

function OrderSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const orderNumber = state?.orderNumber;

  return (
    <div className="order-success-page container">
      <div className="order-success-card">
        <p className="order-success-kicker">Payment Completed</p>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. You will receive an email confirmation soon.</p>

        {(orderNumber || orderId) && (
          <div className="order-success-reference">
            <span>Order Reference</span>
            <strong>{orderNumber || `#${orderId}`}</strong>
          </div>
        )}

        <div className="order-success-actions">
          <Link to="/orders" className="order-success-link alt">View My Orders</Link>
          <Link to="/" className="order-success-link">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
export default OrderSuccess;
