import React from 'react';
import { Link } from 'react-router-dom';

function Home({ tshirts }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Link to="/" className="home-btn" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>🏠 Home</Link>
      </div>
      <div className="products-grid">
        {tshirts.map(tshirt => (
          <div key={tshirt.id} className="product-card">
            <img src={tshirt.image} alt={tshirt.name} className="product-image" />
            <div className="product-info">
              <h3>{tshirt.name}</h3>
              <p className="price">₹{tshirt.price.toLocaleString('en-IN')}</p>
              <Link to={`/product/${tshirt.id}`} className="details-btn">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Home;
