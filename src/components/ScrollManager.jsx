import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Persist scroll positions in sessionStorage so back/forward restores correctly
const STORAGE_KEY = "lt_scroll_map";

function loadScrollMap() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch {
    return new Map();
  }
}

function saveScrollMap(map) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...map]));
  } catch {}
}

function ScrollManager() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // "PUSH" | "REPLACE" | "POP"
  const scrollMap = useRef(loadScrollMap());

  // Record scroll position in memory during scroll and persist only on pagehide/unmount.
  useEffect(() => {
    let rafId = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        scrollMap.current.set(pathname, window.scrollY);
        rafId = null;
      });
    };

    const persistScrollMap = () => {
      scrollMap.current.set(pathname, window.scrollY);
      saveScrollMap(scrollMap.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persistScrollMap);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persistScrollMap);
      if (rafId) cancelAnimationFrame(rafId);
      persistScrollMap();
    };
  }, [pathname]);

  // When pathname changes, either restore (back/forward) or jump to top (new nav)
  useEffect(() => {
    if (navType === "POP") {
      // Back / forward button — restore saved position
      const saved = scrollMap.current.get(pathname) ?? 0;
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "auto" });
      });
    } else {
      // Normal link click / programmatic navigation — go to top
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, navType]);

  return null;
}

export default ScrollManager;
