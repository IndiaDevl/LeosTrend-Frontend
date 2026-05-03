import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaHome, FaTshirt, FaBoxOpen, FaInfoCircle, FaPhoneAlt, FaChevronRight, FaChevronDown, FaSearch } from "react-icons/fa";
import { FiSearch, FiHome, FiShoppingBag, FiPackage, FiHeart, FiShoppingCart } from "react-icons/fi";
import axios from "axios";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CheckoutProvider } from "./context/CheckoutContext";
import Collection from "./pages/Collection";
import Wishlist from "./pages/Wishlist";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ProductDetails from "./pages/ProductDetails";
import DesktopNavbar from "./components/DesktopNavbar";
import MobileNavbar from "./components/MobileNavbar";
import useRipple from "./utils/useRipple";
import { homeProducts } from "./data/products";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddProduct from "./pages/Admin/AddProduct";
import ManageProducts from "./pages/Admin/ManageProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import { normalizeProduct, PRODUCTS_API_URL, PRODUCTS_UPDATED_EVENT } from "./utils/api";

import Loader from "./components/Loader";
import ScrollManager from "./components/ScrollManager";
import ScrollUpButton from "./components/ScrollUpButton";
import TopProgressBar from "./components/TopProgressBar";
import Layout from "./layout/Layout";
import useBodyScrollLock from "./utils/useBodyScrollLock";

import "./App.css";

const CART_STORAGE_KEY = "leostrend_cart";
const SEARCH_STORAGE_KEY = "leostrend_recent_searches";

const formatCategoryLabel = (category = "") => {
  if (category === "zip") return "Zip Sweatshirts";

  return String(category)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getProductId = (product) => {
  const rawId = product?.id ?? product?._id;
  return rawId == null ? "" : String(rawId);
};

const getAvailableStock = (product) => {
	if (typeof product?.stock !== "number") return Number.POSITIVE_INFINITY;
	return product.stock;
};

const getStoredArray = (key) => {
	try {
		const rawValue = sessionStorage.getItem(key);
		if (!rawValue) return [];
		const parsedValue = JSON.parse(rawValue);
		return Array.isArray(parsedValue) ? parsedValue : [];
	} catch {
		return [];
	}
};


// LocalStorage-based wishlist helpers
const WISHLIST_STORAGE_KEY = "leostrend_wishlist";
const getStoredWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const setStoredWishlist = (items) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
};


const normalizeStoredCartItem = (item) => {
  const normalizedProduct = normalizeProduct(item);
  if (!normalizedProduct) return null;

  const size = item.size || "M";
  const quantity = Math.max(1, Number(item.quantity) || 1);

  return {
    ...normalizedProduct,
    size,
    quantity,
    cartKey: item.cartKey || `${normalizedProduct.id}-${size}`,
  };
};

const getStoredRecentSearches = () => {
  try {
    const rawValue = sessionStorage.getItem(SEARCH_STORAGE_KEY);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean).slice(0, 6) : [];
  } catch {
    return [];
  }
};

const reconcileCartItems = (items, products) => {
	if (!Array.isArray(items) || items.length === 0) return [];

  const productMap = new Map(products.map((product) => [getProductId(product), normalizeProduct(product)]));

	return items.flatMap((item) => {
    const storedItem = normalizeStoredCartItem(item);
    if (!storedItem) return [];

    const latestProduct = productMap.get(getProductId(storedItem));
    const baseProduct = latestProduct || storedItem;

    const maxQuantity = getAvailableStock(baseProduct);
    const nextQuantity = Math.max(1, Number(storedItem.quantity) || 1);
		const finalQuantity = maxQuantity === Number.POSITIVE_INFINITY
			? nextQuantity
			: Math.min(nextQuantity, Math.max(maxQuantity, 1));

		return [{
      ...storedItem,
      ...baseProduct,
      size: storedItem.size || "M",
			quantity: finalQuantity,
      cartKey: storedItem.cartKey || `${baseProduct.id}-${storedItem.size || "M"}`,
		}];
	});
};


const reconcileWishlistItems = (items, products) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const productMap = new Map(products.map((product) => [getProductId(product), normalizeProduct(product)]));

  return items.flatMap((item) => {
    const storedItem = normalizeProduct(item);
    if (!storedItem) return [];

    const latestProduct = productMap.get(getProductId(storedItem));
    return [{
      ...storedItem,
      ...(latestProduct || {}),
      wishlistId: storedItem.wishlistId,
      userId: storedItem.userId,
      productId: storedItem.productId || storedItem.id,
    }];
  });
};

/* ── Cart-add toast ─────────────────────────────────────────────── */
function CartToast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <div className="cart-toast-inner">
        {toast.image && (
          <img src={toast.image} alt="" className="cart-toast-img" loading="eager" />
        )}
        <div className="cart-toast-body">
          <span className="cart-toast-label">Added to cart</span>
          <span className="cart-toast-name">{toast.name}</span>
          <span className="cart-toast-price">₹{toast.price}</span>
        </div>
        <button type="button" className="cart-toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
      </div>
      <div className="cart-toast-progress" />
    </div>
  );
}

function SearchOverlay({
  open,
  onClose,
  products,
  searchTerm,
  onSearchTermChange,
  recentSearches,
  onSearchSelect,
  onClearRecent,
}) {
  const inputRef = useRef(null);
  const normalizedQuery = searchTerm.trim().toLowerCase();

  useBodyScrollLock(open, "search-open");

  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];

    return products
      .filter((product) => {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          product.description,
          product.material,
          product.fitType,
          Array.isArray(product.colors) ? product.colors.join(" ") : "",
          Array.isArray(product.sizes) ? product.sizes.join(" ") : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [normalizedQuery, products]);

  const quickCategories = useMemo(() => {
    return [...new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))].slice(0, 4);
  }, [products]);

  const spotlightProducts = useMemo(() => {
    return [...products]
      .sort((first, second) => parseFloat(second.rating || 0) - parseFloat(first.rating || 0))
      .slice(0, 4);
  }, [products]);

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 40);

    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-labelledby="mobile-search-title">
      <button type="button" className="search-overlay-backdrop" onClick={onClose} aria-label="Close search" />
      <div className="search-panel">
        <div className="search-panel-head">
          <div>
            <p className="search-panel-kicker">Search the drop</p>
            <h2 id="mobile-search-title">Find your next fit</h2>
          </div>
          <button type="button" className="search-panel-close" onClick={onClose} aria-label="Close search">
            ✕
          </button>
        </div>

        <div className="search-input-shell">
          <FaSearch className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search..."
          />
        </div>

        <div className="search-panel-body">
          {normalizedQuery ? (
            <>
              <div className="search-section-head">
                <p className="search-section-title">Results</p>
                <span className="search-section-meta">{matchingProducts.length} matches</span>
              </div>

              {matchingProducts.length > 0 ? (
                <div className="search-results-grid">
                  {matchingProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${encodeURIComponent(product.id)}`}
                      className="search-result-card"
                      onClick={() => {
                        onSearchSelect(searchTerm);
                        onClose();
                      }}
                    >
                      <img src={product.image} alt={product.name} className="search-result-image" loading="lazy" />
                      <div className="search-result-copy">
                        <span className="search-result-category">{formatCategoryLabel(product.category)}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description || `${product.brand || "LeosTrend"} premium essential`}</p>
                        <strong>₹{product.price}</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="search-empty-state">
                  <p>No products matched that search yet.</p>
                  <div className="search-chip-row">
                    {quickCategories.map((category) => (
                      <Link
                        key={category}
                        to={`/collection/${category}`}
                        className="search-chip"
                        onClick={onClose}
                      >
                        {formatCategoryLabel(category)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="search-discovery-grid">
                <div className="search-discovery-card search-discovery-card-primary">
                  <p className="search-section-title">Popular categories</p>
                  <div className="search-chip-row">
                    {quickCategories.map((category) => (
                      <Link
                        key={category}
                        to={`/collection/${category}`}
                        className="search-chip"
                        onClick={onClose}
                      >
                        {formatCategoryLabel(category)}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="search-discovery-card">
                  <div className="search-section-head">
                    <p className="search-section-title">Recent</p>
                    {recentSearches.length > 0 && (
                      <button type="button" className="search-text-btn" onClick={onClearRecent}>
                        Clear all
                      </button>
                    )}
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="search-chip-row">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="search-chip search-chip-button"
                          onClick={() => onSearchTermChange(term)}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="search-empty-copy">Your recent searches will show here.</p>
                  )}
                </div>
              </div>

              <div className="search-section-head">
                <p className="search-section-title">Spotlight picks</p>
                <span className="search-section-meta">Fresh shortcuts</span>
              </div>
              <div className="search-results-grid search-results-grid-compact">
                {spotlightProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${encodeURIComponent(product.id)}`}
                    className="search-result-card"
                    onClick={onClose}
                  >
                    <img src={product.image} alt={product.name} className="search-result-image" loading="lazy" />
                    <div className="search-result-copy">
                      <span className="search-result-category">{formatCategoryLabel(product.category)}</span>
                      <h3>{product.name}</h3>
                      <p>{product.brand || "LeosTrend"}</p>
                      <strong>₹{product.price}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Bottom Navigation ───────────────────────────────────── */
function BottomNav({ cartCount, wishlistCount, onCartClick, onWishlistClick }) {
  const { pathname } = useLocation();
  const ripple = useRipple();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <NavLink to="/" className={() => `bnav-item${isActive("/") ? " bnav-active" : ""}`} aria-label="Home" onPointerDown={ripple}>
        <span className="bnav-icon"><FiHome /></span>
        <span className="bnav-label">Home</span>
      </NavLink>

      <NavLink to="/collection/oversized" className={() => `bnav-item${isActive("/collection") ? " bnav-active" : ""}`} aria-label="Shop" onPointerDown={ripple}>
        <span className="bnav-icon"><FiShoppingBag /></span>
        <span className="bnav-label">Shop</span>
      </NavLink>

      <NavLink to="/orders" className={() => `bnav-item${isActive("/orders") ? " bnav-active" : ""}`} aria-label="Orders" onPointerDown={ripple}>
        <span className="bnav-icon"><FiPackage /></span>
        <span className="bnav-label">Orders</span>
      </NavLink>

      <button
        type="button"
        className={`bnav-item${isActive("/wishlist") ? " bnav-active" : ""}`}
        onClick={onWishlistClick}
        onPointerDown={ripple}
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <span className="bnav-icon"><FiHeart /></span>
        <span className="bnav-label">Wishlist</span>
        {wishlistCount > 0 && <span className="bnav-cart-badge">{wishlistCount > 9 ? "9+" : wishlistCount}</span>}
      </button>

      <button type="button" className={`bnav-item bnav-cart-btn${isActive("/cart") ? " bnav-active" : ""}`} onClick={onCartClick} onPointerDown={ripple} aria-label={`Cart, ${cartCount} items`}>
        <span className="bnav-icon"><FiShoppingCart /></span>
        <span className="bnav-label">Cart</span>
        {cartCount > 0 && <span className="bnav-cart-badge">{cartCount > 9 ? "9+" : cartCount}</span>}
      </button>
    </nav>
  );
}

function App() {

const [loading,setLoading] = useState(true);
const [productsLoading,setProductsLoading]=useState(true);
const [tshirts,setTshirts]=useState(()=>homeProducts.map(normalizeProduct));
const [cart,setCart]=useState(()=>getStoredArray(CART_STORAGE_KEY).map(normalizeStoredCartItem).filter(Boolean));
const [wishlist, setWishlist] = useState(getStoredWishlist());

const [menuOpen,setMenuOpen]=useState(false);
const [searchOpen,setSearchOpen]=useState(false);
const [searchTerm,setSearchTerm]=useState("");
const [recentSearches,setRecentSearches]=useState(()=>getStoredRecentSearches());
const [mobileMenuTab, setMobileMenuTab] = useState("menu");
const [megaOpen, setMegaOpen] = useState(false);
const [cartToast, setCartToast] = useState(null);
const [badgePulse, setBadgePulse] = useState(false);
const cartToastTimer = useRef(null);
const megaTriggerRef = useRef(null);

useBodyScrollLock(menuOpen, "mobile-menu-open");

useEffect(()=>{
const timer = setTimeout(()=>{
setLoading(false);
},2000);
return ()=>clearTimeout(timer);
},[]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get(PRODUCTS_API_URL);
      if (Array.isArray(response.data)) {
        setTshirts(response.data.map(normalizeProduct));
      }
    } catch (error) {
      console.error("Product fetch failed:", error.message);
    } finally {
      setProductsLoading(false);
    }
  };

  fetchProducts();
  window.addEventListener(PRODUCTS_UPDATED_EVENT, fetchProducts);

  return () => {
    window.removeEventListener(PRODUCTS_UPDATED_EVENT, fetchProducts);
  };
}, []);


// Customer session logic removed: no customer session or token needed.

useEffect(() => {
	sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}, [cart]);

useEffect(() => {
  setStoredWishlist(wishlist);
}, [wishlist]);

useEffect(() => {
  sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(recentSearches));
}, [recentSearches]);

// No wishlist fetch needed; localStorage only

useEffect(() => {
	if (productsLoading) return;

	setCart((prev) => reconcileCartItems(prev, tshirts));
	setWishlist((prev) => reconcileWishlistItems(prev, tshirts));
}, [productsLoading, tshirts]);

useEffect(() => {
const onPointerDown = (event) => {
if (megaTriggerRef.current && !megaTriggerRef.current.contains(event.target)) {
setMegaOpen(false);
}
};

const onKeyDown = (event) => {
if (event.key === "Escape") {
setMegaOpen(false);
setSearchOpen(false);
}
};

document.addEventListener("pointerdown", onPointerDown);
document.addEventListener("keydown", onKeyDown);

return () => {
document.removeEventListener("pointerdown", onPointerDown);
document.removeEventListener("keydown", onKeyDown);
};
}, []);

if(loading){
return <Loader/>
}

/* ADD TO CART */

const addToCart=(product,size="M",quantity=1)=>{
// Show toast
clearTimeout(cartToastTimer.current);
setCartToast({ name: product.name, image: product.image, price: product.price });
setBadgePulse(true);
cartToastTimer.current = setTimeout(() => {
  setCartToast(null);
  setBadgePulse(false);
}, 2800);

setCart(prev=>{
const quantityToAdd = Math.max(1, Number(quantity) || 1);
const availableStock = getAvailableStock(product);
if (availableStock <= 0) {
return prev;
}

const cartKey = `${product.id}-${size}`;
const existingItem = prev.find((item)=>item.cartKey===cartKey);

if(existingItem){
if (existingItem.quantity >= availableStock) {
return prev;
}

const nextQuantity = existingItem.quantity + quantityToAdd;
const finalQuantity = availableStock === Number.POSITIVE_INFINITY
? nextQuantity
: Math.min(nextQuantity, availableStock);

if (finalQuantity === existingItem.quantity) {
return prev;
}

return prev.map((item)=>
item.cartKey===cartKey
? {...item,quantity:finalQuantity}
: item
);
}

const initialQuantity = availableStock === Number.POSITIVE_INFINITY
? quantityToAdd
: Math.min(quantityToAdd, availableStock);

return [...prev,{...product,size,quantity:initialQuantity,cartKey}];
});
};

/* REMOVE FROM CART */

const removeFromCart=(cartKey)=>{
setCart((prev)=>prev.filter((item)=>item.cartKey!==cartKey));
};

const updateCartQuantity=(cartKey,delta)=>{
setCart((prev)=>prev
.map((item)=>{
if (item.cartKey !== cartKey) return item;

const nextQuantity = item.quantity + delta;
const maxQuantity = getAvailableStock(item);

if (maxQuantity === Number.POSITIVE_INFINITY) {
return { ...item, quantity: nextQuantity };
}

return { ...item, quantity: Math.min(nextQuantity, maxQuantity) };
})
.filter((item)=>item.quantity>0)
);
};

/* TOTAL */

const calculateTotal=()=>{
return cart.reduce((t,i)=>t+i.price*i.quantity,0);
};

const cartItemsCount = cart.reduce((total,item)=>total+item.quantity,0);
const navBrandTicker = [
"LeosTrend",
"Premium Fits",
"Fast Dispatch",
"Limited Drops",
"New Arrivals",
"Shop Now",
];

const toggleMegaMenu = () => {
setMegaOpen((prev) => !prev);
};

const closeMobileMenu = () => {
setMenuOpen(false);
setMegaOpen(false);
setMobileMenuTab("menu");
};

const openMobileMenu = () => {
setMenuOpen(true);
setMobileMenuTab("menu");
setMegaOpen(false);
};

const openSearchOverlay = () => {
  setSearchOpen(true);
  closeMobileMenu();
  setMegaOpen(false);
};

const closeSearchOverlay = () => {
  setSearchOpen(false);
};

const commitRecentSearch = (value) => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return;

  setRecentSearches((prev) => [normalizedValue, ...prev.filter((item) => item.toLowerCase() !== normalizedValue.toLowerCase())].slice(0, 6));
};




// LocalStorage-based wishlist toggle
const toggleWishlist = (product) => {
  const productId = getProductId(product);
  if (!productId) return;
  setWishlist((prev) => {
    const exists = prev.some((item) => getProductId(item) === productId);
    if (exists) {
      return prev.filter((item) => getProductId(item) !== productId);
    } else {
      return [product, ...prev];
    }
  });
};
const isWishlistPending = () => false;

const AppShell = () => {
  const [checkoutStep, setCheckoutStep] = useState(2);

  const handleOrderSuccess = () => {
    setCart([]);
    setCheckoutStep(2);
  };
const location = useLocation();
const navigate = useNavigate();
const showHomeTicker = location.pathname === "/";
const overlayRoot = typeof document !== "undefined" ? document.body : null;

useEffect(() => {
}, []);



const openWishlistPage = () => {
  setMegaOpen(false);
  setMenuOpen(false);
  navigate("/wishlist");
};

const openCartPage = () => {
setMegaOpen(false);
setMenuOpen(false);
navigate("/cart");
};

return(

<>
<ScrollManager />
<TopProgressBar />
<ScrollUpButton />
<CartToast toast={cartToast} onDismiss={() => { clearTimeout(cartToastTimer.current); setCartToast(null); setBadgePulse(false); }} />

<div className="app">

<header className={`navbar${showHomeTicker ? " navbar-with-ticker" : ""}`}>

{showHomeTicker && (
<div className="nav-premium-strip" aria-label="LeosTrend brand ticker">
<div className="nav-strip-glow" aria-hidden="true" />
<div className="nav-strip-track" aria-hidden="true">
{[...navBrandTicker, ...navBrandTicker, ...navBrandTicker, ...navBrandTicker].map((item, idx)=>(
<span key={`${item}-${idx}`} className="nav-strip-item">{item}</span>
))}
</div>
</div>
)}

<div className="navbar-top">
  {/* Desktop only */}
  <DesktopNavbar
    cartItemsCount={cartItemsCount}
    badgePulse={badgePulse}
    openCartPage={openCartPage}
    openSearchOverlay={openSearchOverlay}
    wishlistCount={wishlist.length}
    openWishlistPage={openWishlistPage}
  />
  {/* Mobile only */}
  <MobileNavbar
    menuOpen={menuOpen}
    openMobileMenu={openMobileMenu}
    closeMobileMenu={closeMobileMenu}
    mobileMenuTab={mobileMenuTab}
    setMobileMenuTab={setMobileMenuTab}
    megaOpen={megaOpen}
    toggleMegaMenu={toggleMegaMenu}
    setMegaOpen={setMegaOpen}
    megaTriggerRef={megaTriggerRef}
    cartItemsCount={cartItemsCount}
    badgePulse={badgePulse}
    openCartPage={openCartPage}
    openSearchOverlay={openSearchOverlay}
    openWishlistPage={openWishlistPage}
  />
</div>

</header>

{overlayRoot && createPortal(
  <SearchOverlay
    open={searchOpen}
    onClose={closeSearchOverlay}
    products={tshirts}
    searchTerm={searchTerm}
    onSearchTermChange={setSearchTerm}
    recentSearches={recentSearches}
    onSearchSelect={commitRecentSearch}
    onClearRecent={() => setRecentSearches([])}
  />,
  overlayRoot
)}

{/* ROUTES */}


<main className="main">
  <Routes>
    <Route
      path="/"
      element={
        <Home
          tshirts={tshirts}
          addToCart={addToCart}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          isWishlistPending={isWishlistPending}
        />
      }
    />

<Route
path="/collection/:category"
element={
<Collection
tshirts={tshirts}
addToCart={addToCart}
wishlist={wishlist}
toggleWishlist={toggleWishlist}
isWishlistLoading={isWishlistPending}
productsLoading={productsLoading}
/>
}
/>

<Route
path="/product/:id"
element={
<ProductDetails
tshirts={tshirts}
addToCart={addToCart}
wishlist={wishlist}
toggleWishlist={toggleWishlist}
isWishlistPending={isWishlistPending}
productsLoading={productsLoading}
/>
}
/>

<Route path="/about" element={<About/>}/>
<Route path="/contact" element={<Contact/>}/>

<Route
path="/cart"
element={
<Cart
cart={cart}
removeFromCart={removeFromCart}
updateCartQuantity={updateCartQuantity}
calculateTotal={calculateTotal}
/>
}
/>

<Route
path="/wishlist"
element={
<Wishlist
  wishlist={wishlist}
  toggleWishlist={toggleWishlist}
  addToCart={addToCart}
  isWishlistPending={isWishlistPending}
/>
}
/>

<Route
  path="/checkout"
  element={
    <Checkout
      cart={cart}
      calculateTotal={calculateTotal}
      onOrderSuccess={handleOrderSuccess}
    />
  }
/>

<Route path="/order-success" element={<OrderSuccess/>}/>
<Route path="/orders" element={<Orders/>}/>
<Route path="/orders/:id" element={<OrderDetails/>}/>

<Route path="/admin/login" element={<AdminLogin/>}/>

<Route
path="/admin"
element={
<AdminRoute>
<AdminDashboard/>
</AdminRoute>
}
/>

<Route
path="/admin/add-product"
element={
<AdminRoute>
<AddProduct/>
</AdminRoute>
}
/>

<Route
path="/admin/manage-products"
element={
<AdminRoute>
<ManageProducts/>
</AdminRoute>
}
/>

<Route
path="/admin/orders"
element={
<AdminRoute>
<AdminOrders/>
</AdminRoute>
}
/>

<Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  </main>

  {/* MOBILE BOTTOM NAV */}
  <BottomNav
    cartCount={cartItemsCount}
    wishlistCount={wishlist.length}
    onCartClick={openCartPage}
    onWishlistClick={openWishlistPage}
  />

  {/* FOOTER */}


</div>

</>

);

};

return (
  <Router>
    <CheckoutProvider>
      <AppShell />
    </CheckoutProvider>
  </Router>
);

}

export default App;