import React from 'react';
import { Link } from 'react-router-dom';

function Cart({ cart, removeFromCart, calculateTotal }) {
  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id}>
              <span>{item.name} (Size: {item.size}) - ₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <div>
            <strong>Total: ₹{calculateTotal()}</strong>
          </div>
          <Link to="/checkout">Proceed to Checkout</Link>
        </div>
      )}
    </div>
  );
}
export default Cart;
