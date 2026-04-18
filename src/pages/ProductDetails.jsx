import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import "./ProductDetails.css";

function ProductDetails({
  tshirts = [],
  addToCart,
  wishlist = [],
  toggleWishlist,
  isWishlistPending,
  productsLoading = false,
}) {
const { id } = useParams();
const decodedId = decodeURIComponent(id || "");

const product = useMemo(
() => tshirts.find((item) => String(item.id) === decodedId),
[decodedId, tshirts]
);

const [quantity, setQuantity] = useState(1);
const [selectedSize, setSelectedSize] = useState("M");
const [activeMediaIndex, setActiveMediaIndex] = useState(0);
const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxZoom, setLightboxZoom] = useState(1);
const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
const [lightboxDragging, setLightboxDragging] = useState(false);
const galleryTrackRef = useRef(null);
const lightboxFrameRef = useRef(null);
const lightboxDragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

useBodyScrollLock(lightboxOpen, "product-lightbox-open");

if (!product) {
if (productsLoading) {
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

const stock = typeof product.stock === "number" ? product.stock : Number.POSITIVE_INFINITY;
const outOfStock = stock <= 0;
const lowStock = Number.isFinite(stock) && stock > 0 && stock < 5;
const maxQuantity = stock === Number.POSITIVE_INFINITY ? 10 : Math.max(stock, 1);
const safeMrp = product.mrp || product.price || 1;
const discount = Math.max(0, Math.round((1 - product.price / safeMrp) * 100));
const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["M"];
const availableColors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ["Signature"];
const totalPrice = product.price * quantity;
const productImages = Array.isArray(product.images) && product.images.length > 0
? product.images
: [product.image].filter(Boolean);
const isWishlisted = wishlist.some((item) => String(item.id) === String(product.id));
const isWishlistLoading = Boolean(isWishlistPending?.(product));

useEffect(() => {
setSelectedSize(availableSizes[0]);
setQuantity(1);
setActiveMediaIndex(0);
setZoomPosition({ x: 50, y: 50 });
setLightboxOpen(false);
}, [decodedId, availableSizes]);

useEffect(() => {
  setLightboxZoom(1);
  setLightboxPan({ x: 0, y: 0 });
  setLightboxDragging(false);
}, [activeMediaIndex, lightboxOpen]);

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

const increaseQty = () => setQuantity((prev) => Math.min(prev + 1, maxQuantity));
const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));

const handleAddToCart = () => {
if (outOfStock) return;
addToCart(product, selectedSize, quantity);
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

{typeof product.stock === "number" && product.stock <= 0 && (
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

<div className="image-detail-strip">
<span>LeosTrend Exclusive</span>
<span>Heavyweight Cotton</span>
<span>Street Luxury Fit</span>
</div>

</div>

<div className="details-info">

<div className="details-headline-row">
<p className="details-brand">{product.brand || "LeosTrend"}</p>
<div className="details-headline-actions">
<span className="category-pill">{product.category}</span>
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

<h1>{product.name}</h1>

<div className="price-row">

<span className="price">
₹{product.price}
</span>

<span className="mrp">
₹{product.mrp}
</span>

<span className="savings-pill">Save ₹{Math.max((product.mrp || product.price) - product.price, 0)}</span>

</div>

<p className="details-description">{product.description || "Premium quality apparel."}</p>

<div className="meta-grid">
<p className={`details-stock ${outOfStock ? "is-out" : lowStock ? "is-low" : "is-available"}`}>
{outOfStock ? "Out of Stock" : lowStock ? `Only ${stock} left` : `In stock: ${stock}`}
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
>
{size}
</button>
))}
</div>
</div>

<div className="qty-wrap">
<span>Quantity</span>
<div className="qty-controls">
<button className="quick-btn" onClick={decreaseQty} disabled={quantity <= 1} type="button">-</button>
<span>{quantity}</span>
<button className="quick-btn" onClick={increaseQty} disabled={quantity >= maxQuantity} type="button">+</button>
</div>
</div>

<div className="total-row">
<span>Total</span>
<strong>₹{totalPrice}</strong>
</div>

<button
className={`add-btn ${outOfStock ? "is-disabled" : ""}`}
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
<p>Free shipping above ₹999</p>
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