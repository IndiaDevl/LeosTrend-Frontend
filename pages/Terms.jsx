import React from 'react';

import { useNavigate } from 'react-router-dom';
import "./Terms.css";

function Terms() {
  const navigate = useNavigate();
  return (
    <div className="legal-page container">
      <div className="legal-nav">
        <button onClick={() => navigate(-1)}>⬅ Back</button>
        <button onClick={() => navigate('/')}>🏠 Home</button>
      </div>

      <div className="legal-card">
        <h2>Terms & Conditions</h2>
        <p>By using LeosTrend, you agree to our terms: All sales are final. Returns accepted only for defective products. Please read our full policy before ordering.</p>
      </div>
    </div>
  );
}
export default Terms;
