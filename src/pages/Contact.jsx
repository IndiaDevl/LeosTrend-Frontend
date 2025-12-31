import React from 'react';

import { useNavigate } from 'react-router-dom';
function Contact() {
  const navigate = useNavigate();
  return (
    <div className="info-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate(-1)} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Back</button>
        <button onClick={() => navigate('/')} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Home</button>
      </div>
      <h2>Contact Us</h2>
      <p>For any queries, feedback, or support, reach out to us:</p>
      <ul>
        <li>Email: support@leostrend.com</li>
        <li>Phone: +91-9876543210</li>
        <li>Address: Hyderabad, Telangana, India</li>
      </ul>
    </div>
  );
}
export default Contact;
