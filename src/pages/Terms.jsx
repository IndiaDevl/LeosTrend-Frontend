import React from 'react';

import { useNavigate } from 'react-router-dom';
function Terms() {
  const navigate = useNavigate();
  return (
    <div className="info-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate(-1)} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Back</button>
        <button onClick={() => navigate('/')} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Home</button>
      </div>
      <h2>Terms & Conditions</h2>
      <p>By using LeosTrend, you agree to our terms: All sales are final. Returns accepted only for defective products. Please read our full policy before ordering.</p>
    </div>
  );
}
export default Terms;
