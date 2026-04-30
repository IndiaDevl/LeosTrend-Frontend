import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

export default function DesktopNavbar({
  cartItemsCount,
  badgePulse,
  openCartPage,
  openSearchOverlay,
  wishlistCount,
  openWishlistPage,
}) {
  const [collectionOpen, setCollectionOpen] = useState(false);
  const closeTimer = useRef(null);
  const location = useLocation();
  const showWishlist = location.pathname !== "/";

  const handleMenuEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCollectionOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setCollectionOpen(false), 180);
  };

  return (
    <div className="desktop-navbar">
      {/* LEFT — Nav Links */}
      <nav className="desktop-nav-links">
        <Link to="/">Home</Link>

        {/* Collection with hover dropdown */}
        <div
          className="desktop-collection-wrap"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <Link to="/collection/all" className="desktop-collection-trigger">
            Collection
          </Link>
          {collectionOpen && (
            <div className="desktop-mega-menu" onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
              <div className="desktop-mega-col">
                <h4>T-Shirts</h4>
                <Link to="/collection/oversized" onClick={() => setCollectionOpen(false)}>Oversized</Link>
                <Link to="/collection/street" onClick={() => setCollectionOpen(false)}>Streetwear</Link>
                <Link to="/collection/graphic" onClick={() => setCollectionOpen(false)}>Graphic</Link>
              </div>
              <div className="desktop-mega-col">
                <h4>Sweatshirts</h4>
                <Link to="/collection/sweatshirts" onClick={() => setCollectionOpen(false)}>Crew Sweatshirts</Link>
                <Link to="/collection/zip" onClick={() => setCollectionOpen(false)}>Zip Sweatshirts</Link>
              </div>
              <div className="desktop-mega-col">
                <h4>Hoodies</h4>
                <Link to="/collection/hoodies" onClick={() => setCollectionOpen(false)}>Premium Hoodies</Link>
                <Link to="/collection/minimal" onClick={() => setCollectionOpen(false)}>Minimal Hoodies</Link>
              </div>
            </div>
          )}
        </div>

        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
        <Link to="/orders">Orders</Link>
      </nav>

      {/* CENTER — Logo */}
      <Link to="/" className="desktop-brand" aria-label="LeosTrend home">
        <span className="brand-title">LEOS TREND</span>
      </Link>

      {/* RIGHT — Actions */}
      <div className="desktop-nav-right">
        <button
          type="button"
          className="desktop-search-btn"
          aria-label="Search"
          onClick={openSearchOverlay}
        >
          <FiSearch className="desktop-search-icon" />
        </button>
        {showWishlist && (
          <button
            className="desktop-wishlist-btn"
            onClick={openWishlistPage}
            aria-label="Open wishlist"
          >
            <FaHeart />
            {wishlistCount > 0 && (
              <span className="cart-count">{wishlistCount}</span>
            )}
          </button>
        )}
        {showWishlist && (
          <button
            className="cart-btn"
            onClick={openCartPage}
            aria-label="Open cart"
          >
            <FaShoppingCart />
            <span className={`cart-count${badgePulse ? " badge-pulse" : ""}`}>
              {cartItemsCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
