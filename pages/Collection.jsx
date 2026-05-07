import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaChevronDown, FaHeart, FaRegHeart } from "react-icons/fa";
import ProductTilt from "../components/ProductTilt";
import "./Collection.css";

const isInteractiveTarget = (target) => {
	return Boolean(target?.closest("button, a, input, select, textarea, label, [data-prevent-card-nav='true']"));
};

function Collection({
	tshirts = [],
	addToCart,
	wishlist = [],
	toggleWishlist,
	isWishlistLoading,
	productsLoading = false,
}) {

const { category } = useParams();
const navigate = useNavigate();
const [sortBy, setSortBy] = useState("featured");
const [priceFilters, setPriceFilters] = useState([]);
const [filtersPanelOpen, setFiltersPanelOpen] = useState(true);
const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
const [priceFilterOpen, setPriceFilterOpen] = useState(false);

const categoryAliases = {
street: "oversized",
graphic: "oversized",
minimal: "hoodies"
};

const activeCategory = categoryAliases[category] || category;

const categoryLabels = {
oversized: "Oversized",
sweatshirts: "Sweatshirts",
hoodies: "Hoodies",
zip: "Zip Sweatshirts"
};

const categoryLabel = categoryLabels[activeCategory] || "Collection";

const priceFilterLabels = {
"500-1000": "Rs 500-Rs 1000",
"1000-2000": "Rs 1000-Rs 2000",
"2000+": "Rs 2000+"
};

const isWishlisted = (productId) => wishlist.some((item) => String(item.id) === String(productId));

const toggleFilter = (value, setState) => {
setState((prev) =>
prev.includes(value)
? prev.filter((item) => item !== value)
: [...prev, value]
);
};

const inSelectedPriceRange = (price) => {
if (priceFilters.length === 0) return true;

const checks = {
"500-1000": price >= 500 && price <= 1000,
"1000-2000": price > 1000 && price <= 2000,
"2000+": price > 2000
};

return priceFilters.some((range) => checks[range]);
};

const priceFilterSummary = priceFilters.length === 0
? "All ranges"
: priceFilters.length === 1
? priceFilterLabels[priceFilters[0]]
: `${priceFilters.length} ranges selected`;

const renderFiltersContent = (panelIdPrefix) => (
<>
<p className="active-category-chip">{categoryLabel}</p>

<div className="filter-box">
<button
type="button"
className={`filter-toggle${priceFilterOpen ? " open" : ""}`}
onClick={() => setPriceFilterOpen((prev) => !prev)}
aria-expanded={priceFilterOpen}
aria-controls={`${panelIdPrefix}-price-filter-options`}
>
<span className="filter-toggle-copy">
<span className="filter-toggle-title">Price</span>
<span className="filter-toggle-summary">{priceFilterSummary}</span>
</span>
<FaChevronDown className="filter-toggle-icon" aria-hidden="true" />
</button>

{priceFilterOpen && (
<div id={`${panelIdPrefix}-price-filter-options`} className="filter-options">
<label>
<input
	type="checkbox"
	checked={priceFilters.includes("500-1000")}
	onChange={() => setPriceFilters(prev => prev.includes("500-1000") ? prev.filter(item => item !== "500-1000") : [...prev, "500-1000"])}
	autoComplete="off"
/>
 Rs 500-Rs 1000
</label>
<label>
<input
	type="checkbox"
	checked={priceFilters.includes("1000-2000")}
	onChange={() => setPriceFilters(prev => prev.includes("1000-2000") ? prev.filter(item => item !== "1000-2000") : [...prev, "1000-2000"])}
	autoComplete="off"
/>
 Rs 1000-Rs 2000
</label>
<label>
<input
	type="checkbox"
	checked={priceFilters.includes("2000+")}
	onChange={() => setPriceFilters(prev => prev.includes("2000+") ? prev.filter(item => item !== "2000+") : [...prev, "2000+"])}
	autoComplete="off"
/>
 Rs 2000+
</label>
</div>
)}
</div>
</>
);

/* CATEGORY FILTER */

const filteredProducts = useMemo(() => {
const baseProducts = tshirts.filter((p) => p.category === activeCategory);

const withFilters = baseProducts.filter((product) => {
const matchesPrice = inSelectedPriceRange(product.price);

return matchesPrice;
});

if (sortBy === "price-asc") {
return [...withFilters].sort((a, b) => a.price - b.price);
}

if (sortBy === "price-desc") {
return [...withFilters].sort((a, b) => b.price - a.price);
}

if (sortBy === "discount") {
return [...withFilters].sort(
 (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp
);
}

return withFilters;
}, [activeCategory, sortBy, priceFilters, tshirts]);

return(

<div className="collection-page">

<div className="container collection-shell">

<section className="collection-hero">
<p className="collection-kicker">Curated Drop</p>

<h1 className="collection-title">
{categoryLabel} Collection
</h1>

<p className="collection-subtitle">
Premium pieces with elevated fabric, cleaner fits, and a modern streetwear finish.
</p>
</section>

<div className="collection-top">

<select
className="sort-select"
value={sortBy}
onChange={(e) => setSortBy(e.target.value)}
>
<option value="featured">Featured</option>
<option value="price-asc">Price Low to High</option>
<option value="price-desc">Price High to Low</option>
<option value="discount">Discount</option>
</select>

<button
type="button"
className={`mobile-filters-trigger${mobileFiltersOpen ? " open" : ""}`}
onClick={() => setMobileFiltersOpen((prev) => !prev)}
aria-expanded={mobileFiltersOpen}
aria-controls="mobile-collection-filters-panel"
>
<span className="mobile-filters-trigger-copy">
<span className="mobile-filters-trigger-title">Filters</span>
<span className="mobile-filters-trigger-summary">{categoryLabel}</span>
</span>
<FaChevronDown className="mobile-filters-trigger-icon" aria-hidden="true" />
</button>

</div>

{mobileFiltersOpen && (
<div id="mobile-collection-filters-panel" className="mobile-filters-panel">
{renderFiltersContent("mobile")}
</div>
)}

<div className="collection-layout">

{/* FILTER SIDEBAR */}

<div className="collection-sidebar">
<button
type="button"
className={`filters-panel-toggle${filtersPanelOpen ? " open" : ""}`}
onClick={() => setFiltersPanelOpen((prev) => !prev)}
aria-expanded={filtersPanelOpen}
aria-controls="collection-filters-panel"
>
<span className="filters-panel-copy">
<span className="filters-panel-title">Filters</span>
<span className="filters-panel-summary">{categoryLabel}</span>
</span>
<FaChevronDown className="filters-panel-icon" aria-hidden="true" />
</button>

{filtersPanelOpen && (
<div id="collection-filters-panel" className="filters-panel-body">
{renderFiltersContent("desktop")}
</div>
)}

</div>

{/* PRODUCT GRID */}

<div className="collection-grid">

{productsLoading && filteredProducts.length === 0 && (
[...Array(6)].map((_,i) => (
<div key={i} className="collection-skeleton-card">
<div className="skel skel-image" />
<div className="skel-body">
<div className="skel skel-line skel-brand" />
<div className="skel skel-line skel-title" />
<div className="skel skel-line skel-price" />
<div className="skel skel-line skel-btn" />
</div>
</div>
))
)}

{!productsLoading && filteredProducts.length===0 && (
<p className="cart-empty">No products found for selected filters.</p>
)}

{filteredProducts.map(product=>{

const discount = Math.round(
(1 - product.price / (product.mrp || product.price || 1)) * 100
);

return(

<ProductTilt key={product.id}>

<div
className="collection-card"
style={{cursor:"pointer"}}
onClick={(event) => {
	if (isInteractiveTarget(event.target)) return;
	navigate(`/product/${encodeURIComponent(product.id)}`);
}}
>

<div className="collection-image">

<span className="discount-badge">
{discount}% OFF
</span>

{typeof product.stock === "number" && product.stock <= 0 && (
<span className="stock-badge">Out of Stock</span>
)}

<button
type="button"
className={`collection-wishlist ${isWishlisted(product.id) ? "active" : ""}`}
data-prevent-card-nav="true"
onPointerDown={(event) => {
	event.preventDefault();
	event.stopPropagation();
}}
onClick={async (event) => {
	event.preventDefault();
	event.stopPropagation();

	if (isWishlistLoading?.(product)) return;

	await toggleWishlist?.(product);
}}
disabled={isWishlistLoading?.(product)}
aria-label="Toggle wishlist"
aria-pressed={isWishlisted(product.id)}
>
{isWishlisted(product.id) ? <FaHeart/> : <FaRegHeart/>}
</button>

<div className="collection-image-link">
<img src={product.image} alt={product.name} loading="lazy" decoding="async"/>
</div>

</div>

<div className="collection-info">

<div className="brand">
{product.brand}
</div>

<span className="product-name">
{product.name}
</span>

<div className="price-row">

<span className="price">
₹{product.price}
</span>

<span className="mrp">
₹{product.mrp}
</span>

</div>

<div className="rating">
{product.rating}
</div>

<button
type="button"
className="add-cart-btn"
data-prevent-card-nav="true"
onClick={(e) => { e.stopPropagation(); addToCart(product); }}
disabled={typeof product.stock === "number" && product.stock <= 0}
>
{typeof product.stock === "number" && product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
</button>

</div>

</div>

</ProductTilt>

);

})}

</div>

</div>

</div>

</div>

);

}

export default Collection;