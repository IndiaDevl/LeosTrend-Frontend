import React from 'react';

import { useNavigate } from 'react-router-dom';
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="legal-page container">
      <div className="legal-nav">
        <button onClick={() => navigate(-1)}>⬅ Back</button>
        <button onClick={() => navigate('/')}>🏠 Home</button>
      </div>

      <div className="legal-card">
        <h2>Privacy Policy</h2>
        <p>Your privacy is important to us. We never share your personal information with third parties. All data is securely handled and used only for order processing and communication.</p>
      </div>
    </div>
  );
}
export default PrivacyPolicy;
