import React from 'react';

import { useNavigate } from 'react-router-dom';
function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="info-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate(-1)} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Back</button>
        <button onClick={() => navigate('/')} style={{ color: '#4CAF50', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Home</button>
      </div>
      <h2>Privacy Policy</h2>
      <p>Your privacy is important to us. We never share your personal information with third parties. All data is securely handled and used only for order processing and communication.</p>
    </div>
  );
}
export default PrivacyPolicy;
