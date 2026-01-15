
import React from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
import '../App.css';



function Checkout({ cart, order, setOrder, calculateTotal }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Place order (save in backend)
      await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.customer,
          phone: order.phone,
          email: order.email,
          shippingAddress: order.shippingAddress,
          items: cart,
          total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        })
      });
      // 2. Send notification emails
      await fetch(`${API_URL}/api/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.customer,
          phone: order.phone,
          email: order.email,
          shippingAddress: order.shippingAddress,
          items: cart
        })
      });
      setLoading(false);
      navigate('/order-success');
    } catch (err) {
      setLoading(false);
      setError('Order failed. Please try again.');
    }
  };

  return (
    <div className="checkout-section">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Full Name *</label>
          <input type="text" value={order.customer} onChange={e => setOrder({ ...order, customer: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input type="tel" value={order.phone} onChange={e => setOrder({ ...order, phone: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={order.email} onChange={e => setOrder({ ...order, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Shipping Address *</label>
          <textarea value={order.shippingAddress} onChange={e => setOrder({ ...order, shippingAddress: e.target.value })} required />
        </div>
        <div className="cart-total">
          <strong>Total: ₹{calculateTotal()}</strong>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" className="submit-order-btn" disabled={loading}>{loading ? 'Placing Order...' : 'Place Order'}</button>
      </form>
    </div>
  );
}
export default Checkout;
