import React, { useEffect, useState } from "react";
import HeroSlider from "../components/HeroSlider";
import HeroSliderMobile from "../components/HeroSlider.mobile";
import TrustStrip from "../components/TrustStrip";
import CategoryItems from "../components/CategoryItems";
import CategoryItemsMobile from "../components/CategoryItems.mobile";
import OfferBanner from "../components/OfferBanner";
import OfferBannerMobile from "../components/OfferBanner.mobile";
import TrendingNow from "../components/TrendingNow";
import TrendingNowMobileAutoSlider from "../components/TrendingNowMobileAutoSlider";
import TrustTicker from "../components/TrustTicker";
import BrandImpactStats from "../components/BrandImpactStats";
import BrandImpactStatsMobile from "../components/BrandImpactStats.mobile";
import CustomerReviews from "../components/CustomerReviews";
import ReviewCarousel from "../components/ReviewCarousel";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import Footer from "../components/Footer";
import "./Home.css";
import "./Home.mobile.css";

const MOBILE_BREAKPOINT = 640;

const getIsMobileViewport = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
};

function Home({ tshirts = [], addToCart, wishlist = [], toggleWishlist, isWishlistPending }) {
  const [quickProduct, setQuickProduct] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const isWishlisted = (product) =>
    wishlist.some((item) => String(item.id) === String(product?.id));

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <div className="home-premium">
      {isMobileViewport ? <HeroSliderMobile /> : <HeroSlider />}

      {/* TrustStrip is FULL WIDTH — outside the padded wrapper */}
      <TrustStrip />

      {/* ── Shop by Category ── */}
      <section id="shop-category-section" className="home-section-block home-section-category">
        <div className="home-section-head text-center observe-reveal">
          <p className="home-section-kicker">Curated Collections</p>
          <h2 className="home-section-title">Shop by Category</h2>
        </div>
          {isMobileViewport ? <CategoryItemsMobile /> : <CategoryItems />}
          {isMobileViewport ? <OfferBannerMobile /> : <OfferBanner />}
      </section>



        {isMobileViewport ? (
          <TrendingNowMobileAutoSlider products={tshirts} onQuickView={setQuickProduct} />
        ) : (
          <TrendingNow products={tshirts} onQuickView={setQuickProduct} />
        )}

      <TrustTicker />

        {isMobileViewport ? <BrandImpactStatsMobile /> : <BrandImpactStats />}

      {isMobileViewport ? <ReviewCarousel /> : <CustomerReviews />}

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