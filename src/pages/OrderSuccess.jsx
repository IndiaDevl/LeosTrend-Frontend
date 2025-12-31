import React from 'react';
import { Link } from 'react-router-dom';

function OrderSuccess() {
  return (
    <div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase. You will receive an email confirmation soon.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
export default OrderSuccess;
