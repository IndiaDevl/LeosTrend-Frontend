import React from "react";

const ROW_1_ITEMS = [
  "✦ Free Shipping ₹999+",
  "✦ 7-Day Easy Returns",
  "✦ 100% Authentic Quality",
  "✦ COD Available",
  "✦ Secure Payments",
  "✦ Handpicked Fabrics",
  "✦ Express Dispatch",
  "✦ Free Shipping ₹999+",
  "✦ 7-Day Easy Returns",
  "✦ 100% Authentic Quality",
  "✦ COD Available",
  "✦ Secure Payments",
  "✦ Handpicked Fabrics",
  "✦ Express Dispatch",
];

const ROW_2_ITEMS = [
  "★ 2,400+ Happy Customers",
  "★ 5-Star Rated Brand",
  "★ 98% Satisfaction Rate",
  "★ Premium Cotton Fabrics",
  "★ Ethically Crafted",
  "★ Ships Across India",
  "★ Wear Your Identity",
  "★ 2,400+ Happy Customers",
  "★ 5-Star Rated Brand",
  "★ 98% Satisfaction Rate",
  "★ Premium Cotton Fabrics",
  "★ Ethically Crafted",
  "★ Ships Across India",
  "★ Wear Your Identity",
];

function TrustTicker() {
  return (
    <div className="trust-ticker" aria-label="Our promises">
      <div className="trust-ticker-row">
        <div className="trust-ticker-track" aria-hidden="true">
          {ROW_1_ITEMS.map((item, i) => (
            <span key={i} className="trust-ticker-item">{item}</span>
          ))}
        </div>
      </div>
      <div className="trust-ticker-row" aria-hidden="true">
        <div className="trust-ticker-track trust-ticker-track--reverse">
          {ROW_2_ITEMS.map((item, i) => (
            <span key={i} className="trust-ticker-item">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustTicker;
