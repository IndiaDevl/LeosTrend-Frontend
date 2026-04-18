import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import "./ProductQuickViewModal.css";

function ProductQuickViewModal({ product, onClose, onAddToCart, isWishlisted = false, isWishlistLoading = false, onToggleWishlist }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const galleryTrackRef = useRef(null);
  const modalRef = useRef(null);

  useBodyScrollLock(Boolean(product), "qv-open");

  useEffect(() => {
    if (!product) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  const mediaSources = useMemo(() => {
    if (!product) return [];

    const sourceList = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.additionalImages) ? product.additionalImages : []),
      ...(Array.isArray(product.gallery) ? product.gallery : []),
    ].filter(Boolean);

    return [...new Set(sourceList)];
  }, [product]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setZoomPosition({ x: 50, y: 50 });

    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

    if (galleryTrackRef.current) {
      galleryTrackRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const sizes = Array.isArray(product.sizes) && product.sizes.length
    ? product.sizes.join(" / ")
    : "M / L / XL";
  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const activeImage = mediaSources[activeMediaIndex] || product.image;

  const handleGalleryScroll = () => {
    const track = galleryTrackRef.current;
    if (!track) return;

    const slideWidth = track.clientWidth;
    if (!slideWidth) return;

    const nextIndex = Math.round(track.scrollLeft / slideWidth);
    if (nextIndex !== activeMediaIndex) {
      setActiveMediaIndex(nextIndex);
    }
  };

  const jumpToMedia = (index) => {
    setActiveMediaIndex(index);

    const track = galleryTrackRef.current;
    if (!track) return;

    track.scrollTo({
      left: track.clientWidth * index,
      behavior: "smooth",
    });
  };

  const handleZoomMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const modalMarkup = (
    <div
      className="qv-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick view"
    >
      <div
        className="qv-modal"
        ref={modalRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close quick view"
          className="qv-close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="qv-media-pane">
          <div className="qv-badges-row">
            <span className="qv-category-badge">
              {product.category}
            </span>
            {hasDiscount && !isOutOfStock && (
              <span className="qv-discount-badge">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {isOutOfStock && (
            <span className="qv-stock-badge">
              Out of Stock
            </span>
          )}

          <div className="qv-image-frame">
            <div
              className="qv-image-inner"
              onMouseMove={handleZoomMove}
              onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
            >
              <div
                className="qv-gallery-track"
                ref={galleryTrackRef}
                onScroll={handleGalleryScroll}
              >
                {mediaSources.map((src, index) => (
                  <div className="qv-gallery-slide" key={`${src}-${index}`}>
                    <img
                      src={src}
                      alt={`${product.name} view ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className={`qv-image ${index === activeMediaIndex ? "qv-image-active" : ""}`}
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {mediaSources.length > 1 && (
              <>
                <div className="qv-thumbs-row" aria-label="Choose product image">
                  {mediaSources.map((src, index) => (
                    <button
                      type="button"
                      key={`thumb-${src}-${index}`}
                      className={`qv-thumb-btn ${index === activeMediaIndex ? "active" : ""}`}
                      onClick={() => jumpToMedia(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={src} alt="" className="qv-thumb-img" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>

                <div className="qv-mobile-dots" aria-hidden="true">
                  {mediaSources.map((src, index) => (
                    <span
                      key={`dot-${src}-${index}`}
                      className={`qv-mobile-dot ${index === activeMediaIndex ? "active" : ""}`}
                    />
                  ))}
                </div>
              </>
            )}

            <span className="qv-gesture-hint" aria-hidden="true">
              {mediaSources.length > 1 ? "Swipe to explore" : "Hover to zoom"}
            </span>
          </div>
        </div>

        <div className="qv-content-pane">
          <div className="qv-content-stack">
            <div className="qv-heading-block">
              <p className="qv-brand">
                {product.brand || "LeosTrend"}
              </p>

              <h2 className="qv-title">
                {product.name}
              </h2>
            </div>

            <div className="qv-price-row">
              <strong className="qv-price">
                Rs {product.price}
              </strong>
              {hasDiscount && (
                <span className="qv-mrp">
                  Rs {product.mrp}
                </span>
              )}
            </div>

            <p className="qv-description">
              {product.description || "Signature premium streetwear with a cleaner silhouette, sharp finish, and everyday comfort."}
            </p>

            <div className="qv-chip-row">
              <span className="qv-info-chip">
                Sizes: {sizes}
              </span>
              <span className="qv-info-chip">
                {isOutOfStock ? "Unavailable" : "Ready to ship"}
              </span>
              {product.rating && (
                <span className="qv-info-chip">
                  {product.rating}
                </span>
              )}
            </div>

            <div className="qv-actions-row">
              <button
                type="button"
                disabled={isOutOfStock}
                className="qv-primary-btn"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <FaShoppingCart />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                type="button"
                className={`qv-secondary-btn qv-wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={async () => {
                  if (isWishlistLoading) return;
                  await onToggleWishlist?.(product);
                }}
                disabled={isWishlistLoading}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWishlisted}
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                {isWishlistLoading ? "Saving..." : isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>

              <Link
                to={`/product/${encodeURIComponent(product.id)}`}
                className="qv-secondary-btn"
                onClick={onClose}
              >
                View Product
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalMarkup, document.body)
    : null;
}

export default ProductQuickViewModal;