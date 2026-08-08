import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./BogoOfferPopup.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const SESSION_KEY = "bogo_popup_seen";

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

export default function BogoOfferPopup() {
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    fetch(`${API_BASE}/api/bogo-offer`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.is_active) {
          setOffer(data);
          // Small delay for better UX — let the page load first
          setTimeout(() => setVisible(true), 900);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  const countdown = useCountdown(offer?.end_time);

  if (!visible || !offer || countdown?.expired) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const displayTitle = String(offer.title || "Buy 2 Pay 1")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="bogo-popup-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Limited offer">
      <div className="bogo-popup" onClick={(e) => e.stopPropagation()}>
        <div className="bogo-popup-grid" aria-hidden="true" />
        <div className="bogo-popup-sheen" aria-hidden="true" />
        <div className="bogo-popup-orb" aria-hidden="true" />

        <button className="bogo-popup-close" onClick={handleClose} aria-label="Close">✕</button>

        <div className="bogo-popup-kicker">Today only</div>

        <div className="bogo-popup-tag">Buy 2 Pay 1</div>

        <h2 className="bogo-popup-title">{displayTitle}</h2>

        <p className="bogo-popup-subtitle">Add any 2 items and pay for 1. Applied automatically in cart.</p>

        {offer.end_time && countdown && !countdown.expired && (
          <div className="bogo-popup-countdown-wrap">
            <p className="bogo-popup-expires-label">Offer ends in</p>
            <div className="bogo-popup-countdown">
              <div className="bogo-popup-cd-unit">
                <span className="bogo-popup-cd-num">{pad(countdown.days)}</span>
                <span className="bogo-popup-cd-label">Days</span>
              </div>
              <span className="bogo-popup-cd-sep">:</span>
              <div className="bogo-popup-cd-unit">
                <span className="bogo-popup-cd-num">{pad(countdown.hours)}</span>
                <span className="bogo-popup-cd-label">Hrs</span>
              </div>
              <span className="bogo-popup-cd-sep">:</span>
              <div className="bogo-popup-cd-unit">
                <span className="bogo-popup-cd-num">{pad(countdown.minutes)}</span>
                <span className="bogo-popup-cd-label">Min</span>
              </div>
              <span className="bogo-popup-cd-sep">:</span>
              <div className="bogo-popup-cd-unit">
                <span className="bogo-popup-cd-num">{pad(countdown.seconds)}</span>
                <span className="bogo-popup-cd-label">Sec</span>
              </div>
            </div>
          </div>
        )}

        <div className="bogo-popup-actions">
          <Link to="/collection" className="bogo-popup-cta" onClick={handleClose}>
            Shop Now
          </Link>
          <button className="bogo-popup-skip" onClick={handleClose}>
            Maybe later
          </button>
        </div>

        <p className="bogo-popup-footnote">
          Ends when the timer finishes.
        </p>
      </div>
    </div>
  );
}
