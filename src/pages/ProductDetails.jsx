import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetails({ tshirts, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const tshirt = tshirts.find(t => t.id === parseInt(id));

  if (!tshirt) return <div>Product not found</div>;

  return (
    <div className="product-details">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate(-1)} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Back</button>
        <button onClick={() => navigate('/')} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Home</button>
      </div>
      <img src={tshirt.image} alt={tshirt.name} />
      <h2>{tshirt.name}</h2>
      <p>₹{tshirt.price.toLocaleString('en-IN')}</p>
      <div>
        {tshirt.sizes.map(size => (
          <button key={size} onClick={() => { addToCart(tshirt, size); navigate('/cart'); }}>
            Add {size} to Cart
          </button>
        ))}
      </div>
    </div>
  );
}
export default ProductDetails;
