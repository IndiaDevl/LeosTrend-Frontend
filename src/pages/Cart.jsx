import React from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

function Cart({ cart, removeFromCart, updateCartQuantity, calculateTotal }) {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = calculateTotal();
  const shipping = 70;
  const finalTotal = subtotal + shipping;

  return (
    <div className="cart-page container">

      {/* ── Page header ── */}
      <div className="cart-page-header">
        <p className="cart-kicker">Leos Trend</p>
        <h1 className="section-title">Your Cart</h1>
        {cart.length > 0 && (
          <p className="cart-item-count">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <h2>Your cart is empty</h2>
          <p>Add something from the collection to get started.</p>
          <Link to="/collection">Shop Now</Link>
        </div>
      ) : (
        <div className="cart-container">

          {/* ── Left: items ── */}
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.cartKey} className="cart-item">
                <img src={item.image} alt={item.name} />

                <div className="cart-info">
                  <p className="cart-brand-label">Leos Trend</p>
                  <h3>{item.name}</h3>
                  <p>Size: {item.size || "M"}</p>
                  <p>₹{item.price} × {item.quantity}</p>
                  <p className="item-subtotal">₹{item.price * item.quantity}</p>

                  <div className="qty-controls">
                    <button
                      className="quick-btn"
                      onClick={() => updateCartQuantity(item.cartKey, -1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      className="quick-btn"
                      onClick={() => updateCartQuantity(item.cartKey, 1)}
                      aria-label={`Increase quantity for ${item.name}`}
                    >+</button>
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.cartKey)}
                  aria-label={`Remove ${item.name} from cart`}
                >Remove</button>
              </div>
            ))}
          </div>

          {/* ── Right: summary ── */}
          <div className="cart-summary">
            <p className="summary-kicker">Order Summary</p>
            <h3>Total</h3>

            <div className="summary-row">
              <span>Items ({itemCount})</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>

            <div className="summary-row grand-total">
              <span>Payable</span>
              <span>₹{finalTotal}</span>
            </div>

            <h2>₹{finalTotal}</h2>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>

            <p className="secure-note">Secure checkout &amp; quality-sealed packaging.</p>
          </div>

        </div>
      )}

    </div>
  );
}

export default Cart;