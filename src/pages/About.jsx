import React from 'react';

import { useNavigate } from 'react-router-dom';
function About() {
  const navigate = useNavigate();
  return (
    <div className="info-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate(-1)} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Back</button>
        <button onClick={() => navigate('/')} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Home</button>
      </div>
      <h2>About LeosTrend</h2>
      <p>LeosTrend brings you sacred, modern T-shirt designs inspired by Indian tradition and spirituality. Our mission is to blend comfort, style, and meaning in every piece.</p>
      <ul>
        <li>Premium quality cotton</li>
        <li>Unique spiritual designs</li>
        <li>Fast shipping across India</li>
      </ul>
    </div>
  );
}
export default About;
