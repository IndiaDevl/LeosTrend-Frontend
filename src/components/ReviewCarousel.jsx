import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import "./ReviewCarousel.css";

const reviews = [
  {
    name: "Arjun M.",
    location: "Mumbai",
    review: "Absolutely premium quality. The oversized tee fits perfectly and the fabric is super heavyweight. Will order again!",
    rating: 5,
    initials: "AM",
    color: "#6366f1",
  },
  {
    name: "Priya K.",
    location: "Bengaluru",
    review: "Loved the packaging and the hoodie. Feels like a luxury brand at a fair price. Fast delivery too!",
    rating: 5,
    initials: "PK",
    color: "#ec4899",
  },
  {
    name: "Rahul S.",
    location: "Delhi",
    review: "The zip sweatshirt is insane quality. Stitching is perfect and the spiritual design is unique. Highly recommend.",
    rating: 5,
    initials: "RS",
    color: "#14b8a6",
  },
  {
    name: "Sneha V.",
    location: "Chennai",
    review: "Got two pieces as gifts. Both recipients were amazed by the quality. LeosTrend is now our go-to brand.",
    rating: 5,
    initials: "SV",
    color: "#f59e0b",
  }
];

const AUTO_ADVANCE_DELAY = 3600;
const SWIPE_THRESHOLD = 40;

export default function ReviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselVisible, setIsCarouselVisible] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.visibilityState === "visible";
  });
  const sectionRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);
  const autoAdvanceRef = useRef(0);
  const isAutoAdvanceEnabled = isCarouselVisible && isDocumentVisible;

  const goTo = useCallback((index) => {
    setActiveIndex(((index % reviews.length) + reviews.length) % reviews.length);
  }, []);

  const startAutoAdvance = useCallback(() => {
    window.clearInterval(autoAdvanceRef.current);
    autoAdvanceRef.current = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % reviews.length);
    }, AUTO_ADVANCE_DELAY);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !sectionRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoAdvanceEnabled) {
      window.clearInterval(autoAdvanceRef.current);
      return undefined;
    }

    startAutoAdvance();

    return () => {
      window.clearInterval(autoAdvanceRef.current);
    };
  }, [isAutoAdvanceEnabled, startAutoAdvance]);

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0].clientX;
    touchCurrentXRef.current = event.touches[0].clientX;
    window.clearInterval(autoAdvanceRef.current);
  };

  const handleTouchMove = (event) => {
    touchCurrentXRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchCurrentXRef.current === null) {
      if (isAutoAdvanceEnabled) startAutoAdvance();
      return;
    }

    const swipeDistance = touchStartXRef.current - touchCurrentXRef.current;
    if (Math.abs(swipeDistance) >= SWIPE_THRESHOLD) {
      goTo(activeIndex + (swipeDistance > 0 ? 1 : -1));
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
    if (isAutoAdvanceEnabled) startAutoAdvance();
  };

  return (
    <section className="review-carousel-section reviews-section" ref={sectionRef}>
      <div className="home-section-head text-center observe-reveal" style={{ marginBottom: "32px" }}>
        <p className="home-section-kicker">Customer Love</p>
        <h2 className="home-section-title">What People Say</h2>
        <p className="home-section-subtitle">Real orders. Real people. Real experiences.</p>
      </div>

      <div
        className="review-carousel-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="review-carousel-track"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {reviews.map((r) => (
            <div className="review-carousel-slide" key={r.name}>
              <article className="review-carousel-card">
                <div className="review-carousel-stars" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }).map((_, starIndex) => (
                    <FaStar key={starIndex} />
                  ))}
                </div>

                <p className="review-carousel-text">&ldquo;{r.review}&rdquo;</p>

                <div className="review-carousel-user">
                  <div className="review-carousel-avatar" style={{ background: r.color }}>{r.initials}</div>
                  <div>
                    <div className="review-carousel-name">{r.name}</div>
                    <div className="review-carousel-location">{r.location}</div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="review-carousel-dots" role="tablist" aria-label="Customer reviews">
        {reviews.map((review, index) => (
          <button
            key={review.name}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Review ${index + 1}`}
            className={`review-carousel-dot${index === activeIndex ? " is-active" : ""}`}
            onClick={() => {
              goTo(index);
                if (isAutoAdvanceEnabled) startAutoAdvance();
            }}
          />
        ))}
      </div>
    </section>
  );
}