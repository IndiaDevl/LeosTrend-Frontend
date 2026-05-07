import React from "react";
import { Link } from "react-router-dom";
import "./Wishlist.css";


function Wishlist({ wishlist = [], toggleWishlist, addToCart }) {
  return (
    <div className="wishlist-page container">
      <div className="wishlist-head">
        <div className="wishlist-head-left">
          <p className="wishlist-kicker">Curated Saves</p>
          <h1 className="wishlist-title">Your Wishlist</h1>
        </div>
        <span className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? "item" : "items"}</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty-state">
          <p className="wishlist-empty">Your wishlist is empty.</p>
          <p className="wishlist-empty-sub">Save pieces you love and come back to them anytime.</p>
          <Link to="/collection/oversized" className="wishlist-shop-btn">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="wishlist-list">
          {wishlist.map((item, index) => (
            <article key={item.id} className="wishlist-row" style={{ animationDelay: `${index * 0.06}s` }}>
              <Link to={`/product/${encodeURIComponent(item.id)}`} className="wishlist-image-wrap">
                <img src={item.image} alt={item.name} className="wishlist-img" />
              </Link>

              <div className="wishlist-details">
                <p className="wishlist-brand">{item.brand || "LeosTrend"}</p>
                <Link to={`/product/${encodeURIComponent(item.id)}`} className="wishlist-name-link">
                  <h2 className="wishlist-name">{item.name}</h2>
                </Link>
                {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                  <p className="wishlist-meta">Sizes: {item.sizes.join(", ")}</p>
                )}
              </div>

              <div className="wishlist-right">
                <p className="wishlist-price">&#8377;{item.price}</p>
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;