import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Accent color — pure black, premium
const BAR_COLOR = "#0a0a0a";

function TopProgressBar() {
  const { pathname } = useLocation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    clearAll();

    // Kick off the crawl sequence every time the route changes
    setVisible(true);
    setWidth(0);

    // Phase 1 — quick jump to 20 %
    timers.current.push(setTimeout(() => setWidth(20), 30));
    // Phase 2 — crawl to 60 %
    timers.current.push(setTimeout(() => setWidth(60), 250));
    // Phase 3 — stall at 85 % (waiting for content)
    timers.current.push(setTimeout(() => setWidth(85), 550));
    // Phase 4 — complete, then fade out
    timers.current.push(
      setTimeout(() => {
        setWidth(100);
        timers.current.push(
          setTimeout(() => {
            setVisible(false);
            setWidth(0);
          }, 380)
        );
      }, 750)
    );

    return clearAll;
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        height: "2px",
        width: `${width}%`,
        background: BAR_COLOR,
        boxShadow: "none",
        borderRadius: "0 1px 1px 0",
        pointerEvents: "none",
        transition:
          width === 100
            ? "width 0.15s ease, opacity 0.3s ease"
            : "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: width === 100 ? 0 : 1,
      }}
    />
  );
}

export default TopProgressBar;
