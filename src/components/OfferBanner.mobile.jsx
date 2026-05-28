

import React, { useEffect, useRef, useState } from "react";
import { getOptimizedImageUrl } from "../utils/api";

// Direct mobile offer banner code (replace with your actual banner JSX)
export default function OfferBannerMobile(props) {
  const images = [
    "https://res.cloudinary.com/dppuhxbti/image/upload/v1778127366/25_erfvfc.png",
    "https://res.cloudinary.com/dppuhxbti/image/upload/v1778127050/50_buizou.png",
    "https://res.cloudinary.com/dppuhxbti/image/upload/v1778126829/45_apfas5.png",
    "https://res.cloudinary.com/dppuhxbti/image/upload/v1778125969/save_p0hdta.png"
  ];
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const autoScrollRef = useRef();

  // Auto-scroll logic
  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(autoScrollRef.current);
  }, [images.length]);

  // Touch event handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) { // Minimum swipe distance
        if (diff > 0) {
          // Swipe left, next image
          setCurrent((prev) => (prev + 1) % images.length);
        } else {
          // Swipe right, previous image
          setCurrent((prev) => (prev - 1 + images.length) % images.length);
        }
      }
    }
    // Restart auto-scroll
    autoScrollRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2500);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="offer-banner-mobile"
      style={{ width: '100%', background: '#f5f5f5', padding: 0, textAlign: 'center', borderRadius: 8, margin: '16px 0', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={getOptimizedImageUrl(images[current], { width: 900, height: 420 })}
        alt={`Offer Slide ${current + 1}`}
        loading="eager"
        decoding="async"
        style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', transition: 'all 0.5s' }}
      />
    </div>
  );
}
