# Home Page Components and Fields

## Main Components (in order)
1. HeroSlider / HeroSliderMobile
   - Large hero/banner image slider (desktop/mobile)
2. TrustStrip
   - Full-width trust/brand strip (badges, delivery info)
3. Shop by Category Section
   - Section header: "Curated Collections", "Shop by Category", subtitle
   - CategoryItems (desktop): grid of category cards (Oversized, Sweatshirts, Zip, Hoodies)
   - CategoryItemsMobile (mobile): same as above, mobile-optimized
4. TrendingNow / TrendingNowMobileAutoSlider
   - Trending products grid (desktop) or auto-slider (mobile)
5. BrandImpactStats / BrandImpactStatsMobile
   - Brand impact/statistics section (desktop/mobile)
6. TrustTicker
   - Scrolling ticker or trust badges
7. CustomerReviews
   - Customer reviews/testimonials section
8. ProductQuickViewModal
   - Modal for quick product view (opens on interaction)

## Fields/Elements within Components
- HeroSlider
  - Slide images
  - Headline text (e.g., "Elevate Your Everyday Style")
  - Call-to-action buttons ("Shop Collection", "Our Story")
  - Brand stats ("50+ Happy Customers", "48hr Fast Dispatch", "100% Premium Fabric")
- Shop by Category
  - Section kicker, title, subtitle
  - Category cards:
    - Image
    - Category number (01, 02, ...)
    - Category name (Oversized, etc.)
    - "Explore →" link
- TrendingNow
  - Product cards:
    - Product image
    - Discount badge (if any)
    - Product name, price, old price
    - "Quick View" button
- BrandImpactStats
  - Stats blocks (e.g., "100% Premium Fabric", "48hr Fast Dispatch")
- TrustTicker
  - Scrolling or animated trust/brand messages
- CustomerReviews
  - Review cards (customer name, review text, rating)
- ProductQuickViewModal
  - Product image, name, price, size selector, add to cart, wishlist button

## Global/Utility Components (not page-specific)
- Navbar / DesktopNavbar / MobileNavbar (in App.jsx, not Home.jsx)
- Footer (in App.jsx, not Home.jsx)
- ScrollManager, ScrollUpButton, TopProgressBar (utility, global)
