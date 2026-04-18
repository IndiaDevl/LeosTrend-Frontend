import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TrendingNow.css";

const TRENDING_SECTIONS = [
  { key: "oversized", title: "Oversized" },
  { key: "sweatshirts", title: "Sweatshirts" },
  { key: "hoodies", title: "Hoodies" },
  { key: "zip", title: "Zip Sweatshirts" },
];

function TrendingNow({ products = [], onQuickView }) {
  const navigate = useNavigate();
  const rowRefs = useRef([]);

  const groupedProducts = useMemo(() => {
    return TRENDING_SECTIONS.map((section) => ({
      ...section,
      items: products
        .filter((product) => String(product?.category || "").trim().toLowerCase() === section.key)
        .slice(0, 4),
    }));
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
                className="trending-now-grid"
                ref={(element) => {
                  rowRefs.current[groupIndex] = element;
                }}
              >
                {group.items.map((product) => {
                  const hasDiscount = Number(product?.mrp) > Number(product?.price);
                  const discount = hasDiscount
                    ? Math.round(
                        ((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100
                      )
                    : 0;

                  return (
                    <article key={product.id} className="trending-now-card">
                      <div
                        className="trending-now-image-wrap"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/product/${encodeURIComponent(product.id)}`);
                          }
                        }}
                      >
                        <img src={product.image} alt={product.name} loading="lazy" />

                        {hasDiscount && (
                          <span className="trending-now-discount">{discount}% OFF</span>
                        )}

                        <button
                          type="button"
                          className="trending-now-overlay-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            onQuickView?.(product);
                          }}
                        >
                          Quick View
                        </button>
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
                          <button
                            type="button"
                            className="trending-now-view-btn"
                            onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`)}
                          >
                            View
                          </button>
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