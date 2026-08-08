import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./BogoOfferBanner.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function useCountdown(endTime) {
  const calcRemaining = () => {
    if (!endTime) return null;
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  };

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    if (!endTime) return;
    const id = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r?.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return remaining;
}

export default function BogoOfferBanner() {
  const [offer, setOffer] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch(`${API_BASE}/api/bogo-offer`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.is_active) setOffer(data);
      })
      .catch(() => {});
  }, []);

  const countdown = useCountdown(offer?.end_time);

  if (!offer || dismissed || countdown?.expired) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const displayTitle = String(offer.title || "Buy 2 Pay 1")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="bogo-banner">
      <div className="bogo-banner-grid" aria-hidden="true" />
      <div className="bogo-banner-sheen" aria-hidden="true" />
      <div className="bogo-banner-orb" aria-hidden="true" />
      <div className="bogo-banner-inner">
        <div className="bogo-banner-left">
          <span className="bogo-banner-tag">Limited offer</span>
          <p className="bogo-banner-title">{displayTitle}</p>
          <p className="bogo-banner-subtitle">
            Buy 2 items, pay for 1. Auto-applied in cart.
          </p>
        </div>

        {offer.end_time && countdown && !countdown.expired && (
          <div className="bogo-banner-countdown">
            <div className="bogo-banner-countdown-head">
              <span className="bogo-banner-countdown-label-text">Ends in</span>
              <span className="bogo-banner-countdown-live">Live</span>
            </div>
            <div className="bogo-countdown-unit">
              <span className="bogo-countdown-num">{pad(countdown.days)}</span>
              <span className="bogo-countdown-label">Days</span>
            </div>
            <span className="bogo-countdown-sep">:</span>
            <div className="bogo-countdown-unit">
              <span className="bogo-countdown-num">{pad(countdown.hours)}</span>
              <span className="bogo-countdown-label">Hrs</span>
            </div>
            <span className="bogo-countdown-sep">:</span>
            <div className="bogo-countdown-unit">
              <span className="bogo-countdown-num">{pad(countdown.minutes)}</span>
              <span className="bogo-countdown-label">Min</span>
            </div>
            <span className="bogo-countdown-sep">:</span>
            <div className="bogo-countdown-unit">
              <span className="bogo-countdown-num">{pad(countdown.seconds)}</span>
              <span className="bogo-countdown-label">Sec</span>
            </div>
          </div>
        )}

        <div className="bogo-banner-actions">
          <Link to="/collection" className="bogo-banner-cta">Shop Now</Link>
        </div>
      </div>

      <button
        className="bogo-banner-close"
        onClick={() => setDismissed(true)}
        aria-label="Close offer banner"
      >
        ✕
      </button>
    </div>
  );
}
