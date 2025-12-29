import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaTshirt, FaShoppingCart } from 'react-icons/fa';
import './App.css';

function App() {
  const [tshirts, setTshirts] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState({
    customer: '',
    phone: '',
    shippingAddress: '',
    email: ''
  });

  // Sample T-Shirts Data
  const sampleTshirts = [
    { id: 1, name: "Om LeosTrend T-Shirt", price: 24.99, image: "./Black-T-shirt.webp", sizes: ["S", "M", "L", "XL"] },
    { id: 2, name: "Sri LeosTrend T-Shirt", price: 29.99, image: "./Design image.webp", sizes: ["S", "M", "L", "XL"] },
    { id: 3, name: "Ganesh LeosTrend T-Shirt", price: 27.99, image: "./dragon-embroidered.webp", sizes: ["S", "M", "L"] },
    { id: 4, name: "Shiva LeosTrend T-Shirt", price: 26.99, image: "./white.webp", sizes: ["M", "L", "XL"] }
  ];

  useEffect(() => {
    setTshirts(sampleTshirts);
  }, []);

  const addToCart = (tshirt, size = 'M') => {
    const item = {
      id: Date.now(),
      tshirtId: tshirt.id,
      name: tshirt.name,
      size: size,
      price: tshirt.price,
      quantity: 1,
      image: tshirt.image
    };
    setCart([...cart, item]);
    alert(`${tshirt.name} (Size: ${size}) added to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!order.phone || !order.customer) {
      alert("Please fill in your name and Phone number!");
      return;
    }

    const orderData = {
      ...order,
      items: cart,
      total: calculateTotal()
    };

    try {
    //  const response = await axios.post('http://localhost:1000/api/orders', orderData);
     const response = await axios.post('https://leostrend-backend.onrender.com/api/orders', orderData);

      // Send email notification with all customer and T-shirt details
   // await axios.post('http://localhost:1000/api/send-notification', {
       await axios.post('https://leostrend-backend.onrender.com/api/send-notification', {
        customer: order.customer,
        items: cart,
        phone: order.phone,
        email: order.email,
        shippingAddress: order.shippingAddress
      });

      if (response.data.success) {
        alert(`✅ Order placed successfully!\nOrder ID: ${response.data.orderId}\nEmail notification sent!`);
        setCart([]);
        setOrder({
          customer: '',
          phone: '',
          shippingAddress: '',
          email: ''
        });
      } else {
        alert("Order placed but email notification failed.");
      }
    } catch (error) {
      console.error('Order error:', error);
      alert("Error placing order. Please try again.");
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <FaTshirt className="logo-icon" />
          <h1>LeosTrend</h1>
        </div>
        <div className="cart-info">
          <FaShoppingCart />
          <span>Cart: {cart.length} items (${calculateTotal()})</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Products Section */}
        <section className="products-section">
          <h2>LeosTrend Sacred Collection <FaTshirt /></h2>
          <div className="products-grid">
            {tshirts.map(tshirt => (
              <div key={tshirt.id} className="product-card">
                <img src={tshirt.image} alt={tshirt.name} className="product-image" />
                <div className="product-info">
                  <h3>{tshirt.name}</h3>
                  <p className="price">${tshirt.price}</p>
                  <div className="sizes">
                    {tshirt.sizes.map(size => (
                      <button 
                        key={size} 
                        className="size-btn"
                        onClick={() => addToCart(tshirt, size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(tshirt, 'M')}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order Form Section */}
        <section className="order-section">
          <h2><FaWhatsapp /> Place Your Order</h2>
          
          <div className="cart-summary">
            <h3>Your Cart ({cart.length} items)</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span>{item.name} (Size: {item.size})</span>
                      <span>${item.price} x {item.quantity}</span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total: ${calculateTotal()}</strong>
                </div>
              </div>
            )}
          </div>

          <form className="order-form" onSubmit={handleOrderSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                value={order.customer}
                onChange={(e) => setOrder({...order, customer: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <div className="phone-input">
                <span className="country-code">+91</span>
                <input 
                  type="tel" 
                  value={order.phone}
                  onChange={(e) => setOrder({...order, phone: e.target.value})}
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <small>Order confirmation will be sent to this number</small>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={order.email}
                onChange={(e) => setOrder({...order, email: e.target.value})}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Shipping Address *</label>
              <textarea 
                value={order.shippingAddress}
                onChange={(e) => setOrder({...order, shippingAddress: e.target.value})}
                placeholder="Full address with pincode"
                rows="3"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-order-btn"
              disabled={cart.length === 0}
            >
              <FaWhatsapp /> Place Order
            </button>

            <div className="whatsapp-notice">
              <p>✅ Your order confirmation will be sent via mail automatically</p>
              <p>✅ You'll receive updates on your order status</p>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>LeosTrend &copy; 2024 | Sacred Designs, Modern Wear</p>
        <p>Email Order Notifications: ✅ Active</p>
      </footer>
    </div>
  );
}

export default App;