import React from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
import '../App.css';



function Checkout({ cart, order, setOrder, calculateTotal }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');


  // Razorpay Key ID (replace with your actual key)
  const RAZORPAY_KEY_ID = "rzp_live_S4WMDIdyYilfTV";

  // Dynamically load Razorpay script if not present
  React.useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Get order details from backend
    //  const res = await fetch('http://localhost:1000/api/create-order', {
      const res = await fetch('https://leostrend-backend.onrender.com/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: calculateTotal(), currency: "INR" })
      });
      const data = await res.json();
      if (!data.orderId) {
        alert('Failed to create order');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "LeosTrend",
        description: "T-Shirt Order",
        order_id: data.orderId,
        handler: async function (response) {
          // 3. On payment success, place order and send notification
          const orderRes = await fetch('https://leostrend-backend.onrender.com/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: order.customer,
              items: cart,
              total: calculateTotal(),
              shippingAddress: order.shippingAddress,
              phone: order.phone,
              email: order.email
            })
          });
          if (orderRes.ok) {
            await fetch('https://leostrend-backend.onrender.com/api/send-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: order.customer,
                items: cart,
                phone: order.phone,
                email: order.email,
                shippingAddress: order.shippingAddress
              })
            });
            // Redirect or show success
            navigate('/order-success');
          } else {
            alert('Order placement failed');
          }
          setLoading(false);
        },
        prefill: { name: order.customer, email: order.email, contact: order.phone }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      setError('Payment failed. Please try again.');
    }
  };

  return (
    <div className="checkout-section">
      <h2>Checkout</h2>
      <form className="order-form">
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
        <button type="button" onClick={handlePayment} className="submit-order-btn" disabled={loading}>{loading ? 'Placing Order...' : 'Place Order'}</button>
      </form>
    </div>
  );
}
export default Checkout;
