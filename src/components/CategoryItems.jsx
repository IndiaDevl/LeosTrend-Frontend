import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./CategoryItems.css";

const categoryItems = [
  { key: "oversized", title: "Oversized T-Shirts", image: "/TShirt-Yellow.webp" },
  {
    key: "sweatshirts",
    title: "Sweatshirts",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=90&w=1600&auto=format&fit=crop",
  },
  {
    key: "zip",
    title: "Zip Sweatshirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=90&w=1600&auto=format&fit=crop",
  },
  {
    key: "hoodies",
    title: "Hoodies",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=90&w=1600&auto=format&fit=crop",
  },
];

const CATEGORY_PAGE_DOT_COUNT = 3;

function CategoryItems() {
  const trackRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [isCompactCarousel, setIsCompactCarousel] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1100px)");

    const syncCompactMode = () => {
      setIsCompactCarousel(mediaQuery.matches);
    };

    syncCompactMode();
    mediaQuery.addEventListener("change", syncCompactMode);

    return () => {
      mediaQuery.removeEventListener("change", syncCompactMode);
    };
  }, []);

  const scrollToPage = (pageIndex) => {
    const track = trackRef.current;
    if (!track) return;

    const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
    const pageProgress = CATEGORY_PAGE_DOT_COUNT <= 1 ? 0 : pageIndex / (CATEGORY_PAGE_DOT_COUNT - 1);

    track.scrollTo({
      left: maxScrollLeft * pageProgress,
      behavior: "smooth",
    });

    setActivePage(pageIndex);
  };

  useEffect(() => {
    if (!isCompactCarousel) {
      setActivePage(0);
      return undefined;
    }

    return undefined;
  }, [isCompactCarousel]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
    if (maxScrollLeft === 0) {
      setActivePage(0);
      return;
    }

    const scrollProgress = track.scrollLeft / maxScrollLeft;
    const nextPage = Math.round(scrollProgress * (CATEGORY_PAGE_DOT_COUNT - 1));
    setActivePage(nextPage);
  };

  return (
    <div className="category-items-shell">
      <div className="category-items-grid" ref={trackRef} onScroll={handleScroll}>
        {categoryItems.map((category, index) => (
          <Link
            key={category.key}
            to={`/collection/${category.key}`}
            className="category-items-card observe-reveal"
            style={{ "--reveal-delay": `${index * 90}ms` }}
          >
            <div className="category-items-image-wrap">
              <img src={category.image} alt={category.title} loading="lazy" decoding="async" />
            </div>
            <div className="category-items-label">
              <span className="category-items-label-text">{category.title}</span>
              <span className="category-items-label-arrow" aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="category-items-dots" aria-label="Category carousel navigation">
        {Array.from({ length: CATEGORY_PAGE_DOT_COUNT }, (_, index) => (
          <button
            key={`category-dot-${index}`}
            type="button"
            className={`category-items-dot ${index === activePage ? "active" : ""}`}
            onClick={() => scrollToPage(index)}
            aria-label={`Show category page ${index + 1}`}
            aria-current={index === activePage ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryItems;