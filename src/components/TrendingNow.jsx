
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TrendingNow.css";
import { buildTrendingGroups } from "../utils/trendingNow";
import { getOptimizedImageUrl } from "../utils/api";
import { navigateToPageStart } from "../utils/navigation";


function TrendingNow({ products = [], onQuickView, gridRefs }) {
  // DEBUG: Log all products, their category
  // console.log("TrendingNow products:", products);
  // products.forEach(p => console.log("Product:", p.name, "Category:", p.category));

  const navigate = useNavigate();
  const rowRefs = gridRefs || useRef([]);

  const groupedProducts = useMemo(() => {
    return buildTrendingGroups(products);
  }, [products]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const positionMap = new Map();

    const syncMode = () => {
      if (!mediaQuery.matches) {
        rowRefs.current.forEach((row) => {
          if (row) row.scrollTo({ left: 0, behavior: "auto" });
        });
        positionMap.clear();
        return;
      }
    };

    syncMode();
    mediaQuery.addEventListener("change", syncMode);

    return () => {
      mediaQuery.removeEventListener("change", syncMode);
    };
  }, [groupedProducts]);

  return (
    <section className="trending-now-section">
      <div className="home-section-head text-center observe-reveal">
        <p className="home-section-kicker">Editor Picks</p>
        <h2 className="home-section-title">Trending Now</h2>
        <p className="home-section-subtitle">
          Curated premium essentials from the latest drop
        </p>
      </div>

      <div className="trending-now-stack">
        {groupedProducts.map((group, groupIndex) => (
          <div
            key={group.key}
            className="trending-now-group observe-reveal"
            style={{ "--reveal-delay": `${groupIndex * 80}ms` }}
          >
            <div className="trending-now-group-head">
              <p className="trending-now-group-kicker">Category</p>
              <h3 className="trending-now-group-title">{group.title}</h3>
            </div>

            {group.items.length === 0 ? (
              <p className="trending-now-empty">No products available in this category yet.</p>
            ) : (
              <div
                className="trending-now-grid trending-row"
                ref={(element) => {
                  rowRefs.current[groupIndex] = element;
                }}
              >
                {group.items.map((product) => {
                  const hasDiscount = Number(product?.mrp) > Number(product?.price);
                  let discount = hasDiscount
                    ? Math.round(
                        ((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100
                      )
                    : 0;
                  if (discount >= 100) discount = 99;

                  // Card click handler
                  const handleCardClick = () => {
                    navigateToPageStart(navigate, `/product/${encodeURIComponent(product.id)}`);
                  };

                  return (
                    <article
                      key={product.id}
                      className="trending-now-card premium-card"
                      tabIndex={0}
                      role="button"
                      onClick={handleCardClick}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleCardClick();
                      }}
                      style={{ cursor: 'pointer', willChange: 'transform' }}
                    >
                      <div className="trending-now-image-wrap premium-image-wrap">
                        <img
                          src={getOptimizedImageUrl(product.image, { width: 760, height: 950 })}
                          alt={product.name}
                          loading="lazy"
                          className="premium-img"
                          decoding="async"
                        />
                        {hasDiscount && discount > 0 && (
                          <span className="trending-now-discount">{discount}% OFF</span>
                        )}
                      </div>
                      <div className="trending-now-card-body">
                        <p className="trending-now-card-category">{group.title}</p>
                        <p className="trending-now-card-name">{product.name}</p>
                        <div className="trending-now-card-footer">
                          <div className="trending-now-prices">
                            <span className="trending-now-price-main">₹{product.price}</span>
                            {hasDiscount && (
                              <span className="trending-now-price-mrp">₹{product.mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingNow;