
import React, { useState } from "react";
import "./ProductCard.mobile.css";
import { FaEye, FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import ProductTilt from "./ProductTilt";
import { API_BASE_URL } from "../utils/api";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x500?text=No+Image";

const formatCategoryLabel = (category = "") => {
  if (category === "zip") return "Zip Sweatshirt";
  return String(category)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const isInteractiveTarget = (target) => {
  return Boolean(target?.closest("button, a, input, select, textarea, label, [data-prevent-card-nav='true']"));
};

function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  onOpenDetails,
  showWishlist = false,
  isWishlisted = false,
  isWishlistLoading = false,
  onToggleWishlist,
}) {
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const isLowStock = typeof product.stock === "number" && product.stock > 0 && product.stock < 5;
  const sizeLabel = Array.isArray(product.sizes) && product.sizes.length
    ? product.sizes.join(" / ")
    : "M / L / XL";
  const stockLabel = isOutOfStock
    ? "Out of Stock"
    : isLowStock
      ? `Only ${product.stock} left`
      : typeof product.stock === "number"
        ? `${product.stock} in stock`
        : "Ready to ship";

  // Helper to get correct image URL
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('blob:')) return img;
    if (img.startsWith('/uploads/')) return `${API_BASE_URL}${img}`;
    if (img.startsWith('uploads/')) return `${API_BASE_URL}/${img}`;
    // fallback: just a filename
    return `${API_BASE_URL}/uploads/products/${img.replace(/^.*[\\/]/, '')}`;
  };

  const [imgSrc, setImgSrc] = useState(getImageUrl(product.image));

  return (
    <ProductTilt>
      <article
        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 product-card"
        onClick={(event) => {
          if (isInteractiveTarget(event.target)) return;
          onOpenDetails?.();
        }}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-white flex items-center justify-center product-card-image">
          <img
            src={imgSrc || PLACEHOLDER_IMAGE}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 ease-out"
            style={{ objectFit: 'contain', objectPosition: 'center', background: '#fff', maxWidth: '90%', maxHeight: '90%', margin: 'auto' }}
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />

          {showWishlist && onToggleWishlist ? (
            <button
              type="button"
              data-prevent-card-nav="true"
              className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-lg text-slate-950 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${isWishlisted ? "text-rose-600" : "text-slate-950"}`}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (isWishlistLoading) return;

                await onToggleWishlist();
              }}
              disabled={isWishlistLoading}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWishlisted}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          ) : null}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {formatCategoryLabel(product.category)}
            </span>

            {isOutOfStock ? (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                Only {product.stock} Left
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-x-4 bottom-4 flex translate-y-5 gap-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              data-prevent-card-nav="true"
              className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-slate-100"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onQuickView();
              }}
            >
              <FaEye className="text-xs" />
              Quick View
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              data-prevent-card-nav="true"
              className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAddToCart();
              }}
            >
              <FaShoppingCart className="text-xs" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="line-clamp-2 product-card-title">
            {product.name}
          </h3>
          <div className="product-card-price-row">
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              Rs {product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-slate-400 line-through">
                Rs {product.mrp}
              </span>
            )}
          </div>
          <div className="product-card-btn-row">
            <button
              type="button"
              disabled={isOutOfStock}
              data-prevent-card-nav="true"
              className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 product-card-btn"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAddToCart();
              }}
            >
              <FaShoppingCart className="text-xs" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    </ProductTilt>
  );
}

export default ProductCard;