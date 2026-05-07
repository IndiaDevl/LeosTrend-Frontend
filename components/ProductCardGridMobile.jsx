import React from "react";
import "./ProductCardGridMobile.css";
import ProductCard from "./ProductCard";

const COLLECTIONS = [
  { key: "oversized", title: "Oversized Collection" },
  { key: "sweatshirts", title: "Sweatshirts Collection" },
  { key: "hoodies", title: "Hoodies Collection" },
  { key: "zip", title: "Zip Sweatshirts Collection" },
];

export default function ProductCardGridMobile({ products = [], ...props }) {
  return (
    <>
      {COLLECTIONS.map((col) => {
        const filtered = products.filter(
          (p) => String(p.category || "").toLowerCase() === col.key
        );
        if (!filtered.length) return null;
        return (
          <section key={col.key} className="product-mobile-collection-section">
            <h2 className="product-mobile-collection-title">{col.title}</h2>
            <div className="product-card-grid-mobile-2col">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  {...props}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
