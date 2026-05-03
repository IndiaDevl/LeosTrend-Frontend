import React, { useState } from "react";
import HeroSlider from "../components/HeroSlider";
import HeroSliderMobile from "../components/HeroSlider.mobile";
import TrustStrip from "../components/TrustStrip";
import CategoryItems from "../components/CategoryItems";
import CategoryItemsMobile from "../components/CategoryItems.mobile";
import TrendingNow from "../components/TrendingNow";
import ProductCardGridMobile from "../components/ProductCardGridMobile";
import TrendingNowMobileAutoSlider from "../components/TrendingNowMobileAutoSlider";
import TrustTicker from "../components/TrustTicker";
import BrandImpactStats from "../components/BrandImpactStats";
import BrandImpactStatsMobile from "../components/BrandImpactStats.mobile";
import CustomerReviews from "../components/CustomerReviews";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import Footer from "../components/Footer";
import "./Home.css";
import "./Home.mobile.css";

function Home({ tshirts = [], addToCart, wishlist = [], toggleWishlist, isWishlistPending }) {
  const [quickProduct, setQuickProduct] = useState(null);
  const isWishlisted = (product) =>
    wishlist.some((item) => String(item.id) === String(product?.id));

  return (
    <div className="home-premium">
      {/* Desktop version */}
      <div className="mobile-hide">
        <HeroSlider />
      </div>
      {/* Mobile version */}
      <div className="mobile-show">
        <HeroSliderMobile />
      </div>

      {/* TrustStrip is FULL WIDTH — outside the padded wrapper */}
      <TrustStrip />

      {/* ── Shop by Category ── */}
      <section className="home-section-block home-section-category">
        <div className="home-section-head text-center observe-reveal">
          <p className="home-section-kicker">Curated Collections</p>
          <h2 className="home-section-title">Shop by Category</h2>
          <p className="home-section-subtitle">
            Discover elevated essentials designed for modern everyday wear.
          </p>
        </div>
        {/* Only render one version per device */}
        <div className="mobile-hide">
          <CategoryItems />
        </div>
        <div className="mobile-show">
          <CategoryItemsMobile />
        </div>
      </section>

      {/* Desktop version */}
      <div className="mobile-hide">
        <TrendingNow products={tshirts} onQuickView={setQuickProduct} />
      </div>
      {/* Mobile version */}
      <div className="mobile-show">
        <TrendingNowMobileAutoSlider products={tshirts} onQuickView={setQuickProduct} />
      </div>

      <TrustTicker />

      {/* Desktop version */}
      <div className="mobile-hide">
        <BrandImpactStats />
      </div>
      {/* Mobile version */}
      <div className="mobile-show">
        <BrandImpactStatsMobile />
      </div>

      <CustomerReviews />

      <ProductQuickViewModal
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        onAddToCart={(product) => addToCart(product, "M")}
        isWishlisted={isWishlisted(quickProduct)}
        isWishlistLoading={Boolean(quickProduct && isWishlistPending?.(quickProduct))}
        onToggleWishlist={toggleWishlist}
      />
        <Footer />
    </div>
  );
}

export default Home;