import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import {
  PRODUCTS_UPDATED_EVENT,
  getProductDetailApiUrl,
  getProductReviewsApiUrl,
  normalizeProduct,
} from "../utils/api";
import "./ProductDetails.css";

const DEFAULT_SIZE_CHART = {
  XS: 36,
  S: 38,
  M: 39,
  L: 41,
  XL: 43,
  XXL: 45,
};

const normalizeSizeKey = (value) => String(value || "").trim().toUpperCase();

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });
  } catch {
    return value || "";
  }
};

const getStockForSize = (product, size) => {
  const normalizedSize = normalizeSizeKey(size);
  const sizeStock = product?.sizeStock;
  const hasSizeStock = Boolean(
    sizeStock &&
    typeof sizeStock === "object" &&
    !Array.isArray(sizeStock) &&
    Object.keys(sizeStock).length > 0
  );

  if (normalizedSize && hasSizeStock) {
    if (Object.prototype.hasOwnProperty.call(sizeStock, normalizedSize)) {
      return Math.max(0, Math.trunc(Number(sizeStock[normalizedSize]) || 0));
    }

    return 0;
  }

  return typeof product?.stock === "number" ? product.stock : Number.POSITIVE_INFINITY;
};

function ProductDetails({
  tshirts = [],
  addToCart,
  wishlist = [],
  toggleWishlist,
  isWishlistPending,
  productsLoading = false,
  isBogoOfferActive = false,
}) {
const { id } = useParams();
const decodedId = decodeURIComponent(id || "");

const summaryProduct = useMemo(
() => tshirts.find((item) => String(item.id) === decodedId),
[decodedId, tshirts]
);
const [product, setProduct] = useState(summaryProduct || null);
const [detailLoading, setDetailLoading] = useState(false);

const [quantity, setQuantity] = useState(1);
const [selectedSize, setSelectedSize] = useState("M");
const [activeMediaIndex, setActiveMediaIndex] = useState(0);
const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxZoom, setLightboxZoom] = useState(1);
const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
const [lightboxDragging, setLightboxDragging] = useState(false);
const [shareFeedback, setShareFeedback] = useState("");
const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [reviewError, setReviewError] = useState("");
const [reviewMeta, setReviewMeta] = useState({ total: 0, page: 1, totalPages: 1, stats: { reviewCount: 0, averageRating: 0 } });
const [reviewForm, setReviewForm] = useState({
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  rating: "5",
  title: "",
  comment: "",
});
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const galleryTrackRef = useRef(null);
const lightboxFrameRef = useRef(null);
const lightboxDragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

useBodyScrollLock(lightboxOpen, "product-lightbox-open");

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, [decodedId]);

useEffect(() => {
  setProduct(summaryProduct || null);
}, [summaryProduct]);

useEffect(() => {
  let isMounted = true;

  const loadProductDetails = async ({ forceFresh = false } = {}) => {
    if (!decodedId) return;

    setDetailLoading(true);

    try {
      const response = await axios.get(getProductDetailApiUrl(decodedId), {
        params: forceFresh ? { _ts: Date.now() } : undefined,
      });
      if (isMounted && response?.data) {
        setProduct(normalizeProduct(response.data));
      }
    } catch {
      if (isMounted && !summaryProduct) {
        setProduct(null);
      }
    } finally {
      if (isMounted) {
        setDetailLoading(false);
      }
    }
  };

  const handleProductsUpdated = () => {
    loadProductDetails({ forceFresh: true });
  };

  loadProductDetails({ forceFresh: true });
  window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);

  return () => {
    window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);
    isMounted = false;
  };
}, [decodedId, summaryProduct]);

const loadReviews = async (page = 1) => {
  if (!decodedId) {
    return;
  }

  try {
    setReviewsLoading(true);
    const response = await axios.get(getProductReviewsApiUrl(decodedId), {
      params: { page, limit: 6 },
    });

    setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
    setReviewMeta({
      total: Number(response.data.total || 0),
      page: Number(response.data.page || 1),
      totalPages: Number(response.data.totalPages || 1),
      stats: response.data.stats || { reviewCount: 0, averageRating: 0 },
    });
    setReviewError("");
  } catch (error) {
    setReviewError(error.response?.data?.message || "Failed to load reviews");
  } finally {
    setReviewsLoading(false);
  }
};

useEffect(() => {
  loadReviews(1);
}, [decodedId]);

const safeMrp = product?.mrp || product?.price || 1;
const discount = Math.max(0, Math.round((1 - Number(product?.price || 0) / safeMrp) * 100));
const availableSizes = Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes : ["M"];
const sizeChartRows = availableSizes.map((sizeLabel) => {
  const normalizedSize = normalizeSizeKey(sizeLabel);
  const customMeasurement = Number(product?.sizeChart?.[normalizedSize]);
  const measurement = Number.isFinite(customMeasurement) && customMeasurement > 0
    ? Number(customMeasurement.toFixed(2))
    : (DEFAULT_SIZE_CHART[normalizedSize] ?? "-");

  return {
    size: sizeLabel,
    chest: measurement,
  };
});
const selectedSizeChest = sizeChartRows.find((row) => normalizeSizeKey(row.size) === normalizeSizeKey(selectedSize))?.chest;
const selectedSizeStock = product ? getStockForSize(product, selectedSize) : 0;
const outOfStock = selectedSizeStock <= 0;
const lowStock = Number.isFinite(selectedSizeStock) && selectedSizeStock > 0 && selectedSizeStock < 5;
const maxQuantity = selectedSizeStock === Number.POSITIVE_INFINITY ? 10 : Math.max(selectedSizeStock, 1);
const availableColors = Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : ["Signature"];
const totalPrice = Number(product?.price || 0) * quantity;
const displayPrice = Number(product?.price || 0);
const displayMrp = Number(product?.mrp || 0);
const displaySavings = Math.max((displayMrp || displayPrice) - displayPrice, 0);
const productImages = Array.isArray(product?.images) && product.images.length > 0
? product.images
: [product?.image].filter(Boolean);
const isWishlisted = wishlist.some((item) => String(item.id) === String(product?.id));
const isWishlistLoading = Boolean(product && isWishlistPending?.(product));
const reviewCount = Number(product?.reviewCount ?? reviewMeta.stats?.reviewCount ?? 0);
const averageRating = Number(product?.averageRating ?? reviewMeta.stats?.averageRating ?? 0);
const hasReviews = reviewCount > 0;

useEffect(() => {
if (!product) return;
const firstAvailableSize = availableSizes.find((size) => getStockForSize(product, size) > 0) || availableSizes[0];
setSelectedSize(firstAvailableSize);
setQuantity(1);
setActiveMediaIndex(0);
setZoomPosition({ x: 50, y: 50 });
setLightboxOpen(false);
}, [decodedId, availableSizes, product]);

useEffect(() => {
  setQuantity((prev) => Math.min(prev, maxQuantity));
}, [maxQuantity]);

useEffect(() => {
  setLightboxZoom(1);
  setLightboxPan({ x: 0, y: 0 });
  setLightboxDragging(false);
}, [activeMediaIndex, lightboxOpen]);

useEffect(() => {
  if (!shareFeedback) return undefined;

  const timer = window.setTimeout(() => setShareFeedback(""), 2500);
  return () => window.clearTimeout(timer);
}, [shareFeedback]);

useEffect(() => {
if (!lightboxOpen) return undefined;

const onKeyDown = (event) => {
if (event.key === "Escape") {
setLightboxOpen(false);
return;
}

if (event.key === "ArrowLeft") {
goToPreviousMedia();
}

if (event.key === "ArrowRight") {
goToNextMedia();
}
};

document.addEventListener("keydown", onKeyDown);

return () => {
document.removeEventListener("keydown", onKeyDown);
};
}, [lightboxOpen, activeMediaIndex, productImages.length]);

if (!product) {
if (productsLoading || detailLoading) {
return (
<section className="product-details-page">
<div className="container details-shell">
<div className="product-details-card">
<div className="details-skel-img skel" />
<div className="details-skel-body">
<div className="skel skel-line details-skel-brand" />
<div className="skel skel-line details-skel-title" />
<div className="skel skel-line details-skel-price" />
<div className="skel skel-line details-skel-desc" />
<div className="skel skel-line details-skel-desc" />
<div className="skel skel-line details-skel-btn" />
</div>
</div>
</div>
</section>
);
}
return (
<section className="product-details-page">
<div className="container details-shell">
<div className="product-details-empty">
<h2>Product not found</h2>
<p>This item is unavailable or was removed.</p>
<Link className="view-btn" to="/">Back to Home</Link>
</div>
</div>
</section>
);
}

const increaseQty = () => setQuantity((prev) => Math.min(prev + 1, maxQuantity));
const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));

const handleAddToCart = () => {
if (outOfStock) return;
addToCart(product, selectedSize, quantity);
};

const handleShareProduct = async () => {
  const shareUrl = window.location.href;
  const shareTitle = `${product.name} | LeosTrend`;
  const shareText = `Check out ${product.name} on LeosTrend.`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      setShareFeedback("Shared successfully");
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback("Link copied");
      return;
    }

    const tempInput = document.createElement("input");
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    setShareFeedback("Link copied");
  } catch {
    setShareFeedback("Share unavailable");
  }
};

const handleReviewFieldChange = (event) => {
  const { name, value } = event.target;
  setReviewForm((prev) => ({ ...prev, [name]: value }));
};

const handleReviewSubmit = async (event) => {
  event.preventDefault();

  if (!decodedId) {
    return;
  }

  try {
    setReviewSubmitting(true);
    await axios.post(getProductReviewsApiUrl(decodedId), {
      customerName: reviewForm.customerName,
      customerEmail: reviewForm.customerEmail,
      customerPhone: reviewForm.customerPhone,
      rating: Number(reviewForm.rating),
      title: reviewForm.title,
      comment: reviewForm.comment,
    });

    setReviewForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      rating: "5",
      title: "",
      comment: "",
    });
    await loadReviews(1);
    setShareFeedback("Review submitted");
  } catch (error) {
    setReviewError(error.response?.data?.message || "Failed to submit review");
  } finally {
    setReviewSubmitting(false);
  }
};

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

const showGalleryControls = productImages.length > 1;

const goToPreviousMedia = () => {
const nextIndex = activeMediaIndex === 0 ? productImages.length - 1 : activeMediaIndex - 1;
jumpToMedia(nextIndex);
};

const goToNextMedia = () => {
const nextIndex = activeMediaIndex === productImages.length - 1 ? 0 : activeMediaIndex + 1;
jumpToMedia(nextIndex);
};

const openLightbox = (index = activeMediaIndex) => {
setActiveMediaIndex(index);
setLightboxOpen(true);
};

const closeLightbox = () => {
setLightboxOpen(false);
};

const clampLightboxPan = (nextPan, nextZoom = lightboxZoom) => {
const frame = lightboxFrameRef.current;
if (!frame || nextZoom <= 1) {
return { x: 0, y: 0 };
}

const rect = frame.getBoundingClientRect();
const maxX = ((nextZoom - 1) * rect.width) / 2;
const maxY = ((nextZoom - 1) * rect.height) / 2;

return {
x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
y: Math.max(-maxY, Math.min(maxY, nextPan.y)),
};
};

const updateLightboxZoom = (nextZoom) => {
const boundedZoom = Math.max(1, Math.min(3, nextZoom));
setLightboxZoom(boundedZoom);
setLightboxPan((prev) => clampLightboxPan(prev, boundedZoom));

if (boundedZoom === 1) {
setLightboxDragging(false);
}
};

const handleLightboxToggleZoom = () => {
updateLightboxZoom(lightboxZoom > 1 ? 1 : 2);
};

const handleLightboxWheel = (event) => {
event.preventDefault();

const delta = event.deltaY > 0 ? -0.2 : 0.2;
updateLightboxZoom(lightboxZoom + delta);
};

const handleLightboxPointerDown = (event) => {
if (lightboxZoom <= 1) return;

event.preventDefault();
setLightboxDragging(true);
lightboxDragRef.current = {
startX: event.clientX,
startY: event.clientY,
panX: lightboxPan.x,
panY: lightboxPan.y,
};
};

const handleLightboxPointerMove = (event) => {
if (!lightboxDragging || lightboxZoom <= 1) return;

const deltaX = event.clientX - lightboxDragRef.current.startX;
const deltaY = event.clientY - lightboxDragRef.current.startY;

setLightboxPan(
clampLightboxPan({
x: lightboxDragRef.current.panX + deltaX,
y: lightboxDragRef.current.panY + deltaY,
})
);
};

const handleLightboxPointerEnd = () => {
setLightboxDragging(false);
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

return(

<section className="product-details-page">

<div className="details-atmosphere" />

<div className="container details-shell">

<nav className="details-breadcrumb">
<Link to="/">Home</Link>
<span>/</span>
<Link to={`/collection/${product.category}`}>{product.category}</Link>
<span>/</span>
<span className="active">{product.name}</span>
</nav>

<div className="product-details-card">

<div className="details-image">

<div className="image-sheen" />

<span className="discount">
{discount}% OFF
</span>

{outOfStock && (
<span className="stock-badge">Out of Stock</span>
)}

<div
className="details-gallery-stage"
onMouseMove={handleZoomMove}
onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
onClick={() => openLightbox(activeMediaIndex)}
role="button"
tabIndex={0}
onKeyDown={(event) => {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
openLightbox(activeMediaIndex);
}
}}
>
{showGalleryControls && (
<>
<button
type="button"
className="details-gallery-arrow details-gallery-arrow-left"
onClick={(event) => {
event.stopPropagation();
goToPreviousMedia();
}}
aria-label="Previous image"
>
‹
</button>

<button
type="button"
className="details-gallery-arrow details-gallery-arrow-right"
onClick={(event) => {
event.stopPropagation();
goToNextMedia();
}}
aria-label="Next image"
>
›
</button>
</>
)}

<div className="details-gallery-track" ref={galleryTrackRef} onScroll={handleGalleryScroll}>
{productImages.map((image, index) => (
<div className="details-gallery-slide" key={`${image}-${index}`}>
<img
src={image}
alt={`${product.name} view ${index + 1}`}
loading="lazy"
decoding="async"
className={`details-gallery-image ${index === activeMediaIndex ? "is-active" : ""}`}
style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
/>
</div>
))}
</div>
</div>

<span className="details-gallery-hint" aria-hidden="true">
{showGalleryControls ? "Swipe or tap arrows to explore" : "Hover to inspect premium detail"}
</span>

{productImages.length > 1 && (
<>
<div className="details-thumbs-row" aria-label="Choose product image">
{productImages.map((image, index) => (
<button
type="button"
key={`thumb-${image}-${index}`}
className={`details-thumb-btn ${index === activeMediaIndex ? "active" : ""}`}
onClick={() => jumpToMedia(index)}
aria-label={`View image ${index + 1}`}
>
<img src={image} alt="" className="details-thumb-img" loading="lazy" decoding="async"/>
</button>
))}
</div>

<div className="details-mobile-dots" aria-hidden="true">
{productImages.map((image, index) => (
<span key={`dot-${image}-${index}`} className={`details-mobile-dot ${index === activeMediaIndex ? "active" : ""}`} />
))}
</div>
</>
)}

</div>

<div className="details-info">

<div className="details-headline-row">
<p className="details-brand">{product.brand || "LeosTrend"}</p>
<div className="details-headline-actions">
<span className="category-pill">{product.category}</span>
<button
type="button"
className="details-share-btn"
onClick={async (event) => {
event.preventDefault();
event.stopPropagation();

await handleShareProduct();
}}
aria-label="Share product"
>
<FaShareAlt className="details-share-icon" aria-hidden="true" />
<span className="details-share-label">Share</span>
</button>
<button
type="button"
className={`details-wishlist-btn ${isWishlisted ? "active" : ""}`}
onClick={async (event) => {
event.preventDefault();
event.stopPropagation();

if (isWishlistLoading) return;

await toggleWishlist?.(product);
}}
disabled={isWishlistLoading}
aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
aria-pressed={isWishlisted}
>
{isWishlisted ? <FaHeart /> : <FaRegHeart />}
</button>
</div>
</div>

{shareFeedback && <p className="details-share-feedback" aria-live="polite">{shareFeedback}</p>}

<h1>{product.name}</h1>

<div className="price-row">

<span className="price">
₹{displayPrice}
</span>

{displayMrp && (
<span className="mrp">
₹{displayMrp}
</span>
)}

<span className="savings-pill">Save ₹{displaySavings}</span>

</div>

<p className="details-description">{product.description || "Premium quality apparel."}</p>

<div className="details-review-summary-inline">
  <strong>{hasReviews ? `${averageRating.toFixed(1)} / 5` : "New Arrival"}</strong>
  <span>{hasReviews ? `based on ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : "Be the first to review this product"}</span>
</div>

<div className="meta-grid">
<p className={`details-stock ${outOfStock ? "is-out" : lowStock ? "is-low" : "is-available"}`}>
{outOfStock ? `Out of Stock (${selectedSize})` : lowStock ? `Only ${selectedSizeStock} left (${selectedSize})` : `In stock (${selectedSize}): ${selectedSizeStock}`}
</p>
<p className="details-rating">Label: {product.rating || "New"}</p>
</div>

<div className="color-wrap">
<span>Color</span>
<div className="color-list">
{availableColors.map((color) => (
<span key={color} className="color-chip">{color}</span>
))}
</div>
</div>

<div className="size-wrap">
<span>Size</span>
<div className="size-list">
{availableSizes.map((size) => (
<button
key={size}
className={`size-chip ${selectedSize === size ? "active" : ""}`}
onClick={() => setSelectedSize(size)}
type="button"
disabled={getStockForSize(product, size) <= 0}
>
{size}
</button>
))}
</div>
</div>

<div className="size-chart-wrap" aria-label="Size chart">
  <p className="size-chart-title">Size Chart (Chest in inches)</p>
  <div className="size-chart-grid">
    {sizeChartRows.map((row) => (
      <div key={`size-chart-${row.size}`} className={`size-chart-item ${normalizeSizeKey(row.size) === normalizeSizeKey(selectedSize) ? "active" : ""}`}>
        <span className="size-chart-size">{row.size}</span>
        <strong className="size-chart-value">{row.chest}</strong>
      </div>
    ))}
  </div>
  {selectedSizeChest !== undefined && (
    <p className="size-chart-selected">Selected: {selectedSize} = {selectedSizeChest}" chest</p>
  )}
</div>

<div className="qty-wrap">
<span>Quantity</span>
<div className="qty-controls">
<button className="quick-btn" onClick={decreaseQty} disabled={quantity <= 1} type="button">-</button>
<span>{quantity}</span>
<button className="quick-btn" onClick={increaseQty} disabled={quantity >= maxQuantity} type="button">+</button>
</div>
</div>

{isBogoOfferActive && (
  <div className="bogo-purchase-note">
    <strong>Offer:</strong> Buy 2 items, pay for 1. Applied automatically in cart.
  </div>
)}

<div className="total-row">
<span>Item total</span>
<strong>₹{totalPrice}</strong>
</div>

<button
className={`add-btn ${outOfStock ? "is-disabled" : ""} ${isBogoOfferActive ? "bogo-active" : ""}`}
onClick={handleAddToCart}
disabled={outOfStock}
>

{outOfStock ? "Out of Stock" : `Add ${quantity} To Cart`}

</button>

<Link to={`/collection/${product.category}`} className="view-btn details-back-link">
Back to {product.category}
</Link>

<div className="details-promise">
<p>Premium finish and quality checked before dispatch.</p>
<p>Easy replacement on damaged delivery.</p>
</div>

<div className="details-foot-grid">
<article>
<h4>Style Notes</h4>
<ul>
<li>Relaxed drape designed for statement layering.</li>
<li>Soft-touch interior for all-day comfort.</li>
<li>Built to pair with cargos, denims, and joggers.</li>
</ul>
</article>

<article>
<h4>Delivery</h4>
<p>Dispatch in 24-48 hrs</p>
<p>Shipping: Free for 1 item, ₹50 for 2+ items</p>
<p>Secure packaging with quality seal</p>
</article>
</div>

{(product.material || product.fit || product.careInstructions || product.sku) && (
  <div className="details-specs-block">
    <h4>Product Specs</h4>
    <dl className="details-specs-dl">
      {product.sku && (
        <>
          <dt>SKU</dt>
          <dd>{product.sku}</dd>
        </>
      )}
      {product.brand && (
        <>
          <dt>Brand</dt>
          <dd>{product.brand}</dd>
        </>
      )}
      {product.material && (
        <>
          <dt>Material</dt>
          <dd>{product.material}</dd>
        </>
      )}
      {product.fit && (
        <>
          <dt>Fit</dt>
          <dd>{product.fit}</dd>
        </>
      )}
      {product.careInstructions && (
        <>
          <dt>Care</dt>
          <dd>{product.careInstructions}</dd>
        </>
      )}
    </dl>
  </div>
)}

<section className="product-reviews-block" aria-label="Customer reviews">
  <div className="product-reviews-head">
    <h3>Customer Reviews</h3>
    <span>{hasReviews ? `${averageRating.toFixed(1)} / 5 (${reviewCount})` : "No reviews yet"}</span>
  </div>

  <form className="product-review-form" onSubmit={handleReviewSubmit}>
    <div className="product-review-form-grid">
      <label>
        Name
        <input
          name="customerName"
          value={reviewForm.customerName}
          onChange={handleReviewFieldChange}
          required
          minLength={2}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="customerEmail"
          value={reviewForm.customerEmail}
          onChange={handleReviewFieldChange}
          placeholder="optional"
        />
      </label>
      <label>
        Phone
        <input
          name="customerPhone"
          value={reviewForm.customerPhone}
          onChange={handleReviewFieldChange}
          placeholder="optional"
        />
      </label>
      <label>
        Rating
        <select name="rating" value={reviewForm.rating} onChange={handleReviewFieldChange}>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>
    </div>

    <label>
      Title
      <input
        name="title"
        value={reviewForm.title}
        onChange={handleReviewFieldChange}
        maxLength={160}
      />
    </label>

    <label>
      Your review
      <textarea
        name="comment"
        value={reviewForm.comment}
        onChange={handleReviewFieldChange}
        minLength={8}
        required
      />
    </label>

    <button type="submit" className="add-btn" disabled={reviewSubmitting}>
      {reviewSubmitting ? "Submitting..." : "Submit Review"}
    </button>
  </form>

  {reviewError && <p className="error-msg">{reviewError}</p>}

  <div className="product-reviews-list">
    {reviewsLoading && <p>Loading reviews...</p>}
    {!reviewsLoading && reviews.length === 0 && <p>No reviews yet. Be the first to review this product.</p>}
    {!reviewsLoading && reviews.map((review) => (
      <article key={review.id} className="product-review-card">
        <div className="product-review-top">
          <strong>{review.customerName}</strong>
          <span>{formatDate(review.createdAt)}</span>
        </div>
        <div className="product-review-rating">{"★".repeat(Math.max(0, Math.trunc(Number(review.rating) || 0)))}{"☆".repeat(5 - Math.max(0, Math.trunc(Number(review.rating) || 0)))}</div>
        {review.title && <p className="product-review-title">{review.title}</p>}
        <p className="product-review-comment">{review.comment}</p>
        {review.isVerifiedBuyer && <span className="product-review-verified">Verified Buyer</span>}
      </article>
    ))}
  </div>

  {reviewMeta.totalPages > 1 && (
    <div className="product-reviews-pagination">
      <button
        type="button"
        className="view-btn"
        onClick={() => loadReviews(Math.max(1, reviewMeta.page - 1))}
        disabled={reviewMeta.page <= 1}
      >
        Previous
      </button>
      <span>Page {reviewMeta.page} of {reviewMeta.totalPages}</span>
      <button
        type="button"
        className="view-btn"
        onClick={() => loadReviews(Math.min(reviewMeta.totalPages, reviewMeta.page + 1))}
        disabled={reviewMeta.page >= reviewMeta.totalPages}
      >
        Next
      </button>
    </div>
  )}
</section>

</div>

</div>

</div>

{lightboxOpen && (
<div className="details-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Product image viewer">
<button
type="button"
className="details-lightbox-back"
onClick={closeLightbox}
aria-label="Back to product page"
>
<span aria-hidden="true">&lt;</span>
<span className="details-lightbox-back-full">Back to product</span>
<span className="details-lightbox-back-short">Back</span>
</button>

<button
type="button"
className="details-lightbox-close"
onClick={closeLightbox}
aria-label="Close image viewer"
>
✕
</button>

{showGalleryControls && (
<>
<button
type="button"
className="details-lightbox-arrow details-lightbox-arrow-left"
onClick={(event) => {
event.stopPropagation();
goToPreviousMedia();
}}
aria-label="Previous image"
>
‹
</button>

<button
type="button"
className="details-lightbox-arrow details-lightbox-arrow-right"
onClick={(event) => {
event.stopPropagation();
goToNextMedia();
}}
aria-label="Next image"
>
›
</button>
</>
)}

<div className="details-lightbox-frame" onClick={(event) => event.stopPropagation()}>
<div
className={`details-lightbox-media ${lightboxZoom > 1 ? "is-zoomed" : ""} ${lightboxDragging ? "is-dragging" : ""}`}
ref={lightboxFrameRef}
onWheel={handleLightboxWheel}
onPointerMove={handleLightboxPointerMove}
onPointerUp={handleLightboxPointerEnd}
onPointerLeave={handleLightboxPointerEnd}
>
<img
src={productImages[activeMediaIndex]}
alt={`${product.name} full view ${activeMediaIndex + 1}`}
className="details-lightbox-image"
loading="eager"
decoding="async"
onClick={handleLightboxToggleZoom}
onPointerDown={handleLightboxPointerDown}
style={{ transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxZoom})` }}
/>

<button
type="button"
className="details-lightbox-zoom-btn"
onClick={handleLightboxToggleZoom}
aria-label={lightboxZoom > 1 ? "Reset zoom" : "Zoom image"}
>
{lightboxZoom > 1 ? "Reset" : "Zoom"}
</button>

<span className="details-lightbox-hint" aria-hidden="true">
{lightboxZoom > 1 ? "Drag to inspect details" : "Tap or wheel to zoom"}
</span>
</div>

{showGalleryControls && (
<div className="details-lightbox-dots" aria-hidden="true">
{productImages.map((image, index) => (
<button
type="button"
key={`lightbox-dot-${image}-${index}`}
className={`details-lightbox-dot ${index === activeMediaIndex ? "active" : ""}`}
onClick={() => jumpToMedia(index)}
aria-label={`View image ${index + 1}`}
/>
))}
</div>
)}
</div>
</div>
)}

</section>

);

}

export default ProductDetails;