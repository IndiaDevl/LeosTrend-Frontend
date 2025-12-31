
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FaTshirt, FaShoppingCart } from 'react-icons/fa';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
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
    { id: 1, name: "Om LeosTrend T-Shirt", price: 2499, image: "./Black-T-shirt.webp", sizes: ["S", "M", "L", "XL"] },
    { id: 2, name: "Sri LeosTrend T-Shirt", price: 2999, image: "./Design image.webp", sizes: ["S", "M", "L", "XL"] },
    { id: 3, name: "Ganesh LeosTrend T-Shirt", price: 2799, image: "./dragon-embroidered.webp", sizes: ["S", "M", "L"] },
    { id: 4, name: "Shiva LeosTrend T-Shirt", price: 2699, image: "./white.webp", sizes: ["M", "L", "XL"] },
        { id: 5, name: "Om LeosTrend T-Shirt", price: 2499, image: "./Black-T-shirt.webp", sizes: ["S", "M", "L", ] },
    { id: 6, name: "Sri LeosTrend T-Shirt", price: 2999, image: "./Design image.webp", sizes: ["S", "M", "L", ] },
        { id: 7, name: "Ganesh LeosTrend T-Shirt", price: 2799, image: "./dragon-embroidered.webp", sizes: ["S", "M", "L"] },
    { id: 8, name: "Shiva LeosTrend T-Shirt", price: 2699, image: "./white.webp", sizes: ["M", "L", "XL"] }
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
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('en-IN');
  };

  return (
    <Router>
      <>
        <Helmet>
          <title>LeosTrend</title>
        </Helmet>
        <div className="app">
          {/* Top-level Title */}
          <div style={{ width: '100%', background: '#fff', textAlign: 'center', padding: '18px 0 0 0', fontSize: '2.2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#1a1a2e', textShadow: '0 2px 8px #e7e9f1' }}>
            LeosTrend
          </div>
          {/* Header */}
          <header className="header">
            <div className="logo">
              <FaTshirt className="logo-icon" />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>T-Shirts</span>
            </div>
            <div className="cart-info">
              <FaShoppingCart />
              <span>Cart: {cart.length} items (₹{calculateTotal()})</span>
            </div>
          </header>

          <main className="main-content" style={{ minHeight: '70vh', width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home tshirts={tshirts} />} />
              <Route path="/product/:id" element={<ProductDetails tshirts={tshirts} addToCart={addToCart} />} />
              <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} calculateTotal={calculateTotal} />} />
              <Route path="/checkout" element={<Checkout cart={cart} order={order} setOrder={setOrder} calculateTotal={calculateTotal} />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="footer">
            <nav style={{ marginBottom: 8 }}>
              <a href="/about">About</a> |
              <a href="/contact">Contact</a> |
              <a href="/privacy-policy">Privacy Policy</a> |
              <a href="/terms">Terms</a>
            </nav>
            <p>LeosTrend &copy; 2024 | Sacred Designs, Modern Wear</p>
            <p>Email Order Notifications: ✅ Active</p>
          </footer>
        </div>
      </>
    </Router>
  );
}

export default App;