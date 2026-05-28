import { useEffect, useRef, useState, useCallback } from "react";
import { getOptimizedImageUrl } from "../utils/api";
import "./OfferBanner.css";

const BANNERS = [
  {
    src: "https://res.cloudinary.com/dppuhxbti/image/upload/v1778127366/25_erfvfc.png",
    alt: "Flat 25% Off – Grand Opening Special Offer",
  },
  {
    src: "https://res.cloudinary.com/dppuhxbti/image/upload/v1778127050/50_buizou.png",
    alt: "Flat 50% Off – Limited Time Offer",
  },
  {
    src: "https://res.cloudinary.com/dppuhxbti/image/upload/v1778126829/45_apfas5.png",
    alt: "Flat 45% Off – Premium Streetwear",
  },
  {
    src: "https://res.cloudinary.com/dppuhxbti/image/upload/v1778125969/save_p0hdta.png",
    alt: "Save Big – Exclusive Deal",
  },
];

const AUTO_INTERVAL = 2800;
const SWIPE_THRESHOLD = 45;

export default function OfferBanner() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [animated, setAnimated] = useState(true);

  const startXRef = useRef(0);
  const autoRef = useRef(null);
  const trackRef = useRef(null);
  const total = BANNERS.length;

  const goTo = useCallback((index, withAnim = true) => {
    setAnimated(withAnim);
    setCurrent(((index % total) + total) % total);
    setDragOffset(0);
  }, [total]);

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
      setAnimated(true);
      setDragOffset(0);
    }, AUTO_INTERVAL);
  }, [total]);

  const stopAuto = useCallback(() => {
    clearInterval(autoRef.current);
  }, []);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  // Touch handlers
  const handleTouchStart = (e) => {
    stopAuto();
    startXRef.current = e.touches[0].clientX;
    setDragging(true);
    setAnimated(false);
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      goTo(dragOffset < 0 ? current + 1 : current - 1, true);
    } else {
      goTo(current, true);
    }
    startAuto();
  };

  // Mouse drag (desktop)
  const handleMouseDown = (e) => {
    stopAuto();
    startXRef.current = e.clientX;
    setDragging(true);
    setAnimated(false);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      setDragOffset(e.clientX - startXRef.current);
    };
    const onUp = () => {
      if (!dragging) return;
      setDragging(false);
      if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        goTo(dragOffset < 0 ? current + 1 : current - 1, true);
      } else {
        goTo(current, true);
      }
      startAuto();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, dragOffset, current, goTo, startAuto]);

  const translateX = `calc(${-current * 100}% + ${dragOffset}px)`;

  return (
    <section className="offer-banner">
      <div
        className={`offer-track ${animated ? "offer-track--animated" : ""}`}
        style={{ transform: `translateX(${translateX})` }}
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {BANNERS.map((banner, i) => (
          <div className="offer-slide" key={i}>
            <img
              src={getOptimizedImageUrl(banner.src, { width: 1600, height: 900 })}
              alt={banner.alt}
              className="offer-image"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable="false"
            />
          </div>
        ))}
      </div>

      <div className="offer-dots" role="tablist" aria-label="Offer slides">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            className={`offer-dot ${i === current ? "offer-dot--active" : ""}`}
            onClick={() => { goTo(i); startAuto(); }}
          />
        ))}
      </div>
    </section>
  );
}