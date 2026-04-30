import React from "react";
import "./DiscountBadge.css";

export default function DiscountBadge({ children }) {
  return <span className="discount-badge">{children}</span>;
}
