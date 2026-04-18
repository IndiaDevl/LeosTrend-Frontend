import React from "react";
import { Link } from "react-router-dom";
import "./Wishlist.css";


function Wishlist({ wishlist = [], toggleWishlist, addToCart }) {
  return (
    <div className="wishlist-page container">
      <div className="wishlist-atmosphere" />

      <div className="wishlist-head">
        <div>
          <h1 className="section-title">Your Wishlist</h1>
          <p className="wishlist-subtitle">Saved pieces you can come back to anytime.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty-state">
          <p className="wishlist-empty">No wishlist items yet.</p>
          <Link to="/collection/oversized" className="wishlist-shop-btn">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item, index) => (
            <article key={item.id} className="wishlist-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <Link to={`/product/${encodeURIComponent(item.id)}`} className="wishlist-image-link">
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="wishlist-info">
                <p className="wishlist-brand">{item.brand || "LeosTrend"}</p>
                <Link to={`/product/${encodeURIComponent(item.id)}`} className="wishlist-name-link">
                  <h3>{item.name}</h3>
                </Link>
                <p className="wishlist-price">9{item.price}</p>
              </div>

              <div className="wishlist-actions">
                <button
                  type="button"
                  className="wishlist-add-btn"
                  onClick={() => addToCart(item, Array.isArray(item.sizes) && item.sizes.length ? item.sizes[0] : "M")}
                  disabled={typeof item.stock === "number" && item.stock <= 0}
                >
                  {typeof item.stock === "number" && item.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  className="wishlist-remove-btn"
                  onClick={() => toggleWishlist?.(item)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
