import { useEffect, useLayoutEffect, useRef } from "react";
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

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return undefined;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // Persist the current route position when leaving the page or route.
  useEffect(() => {
    const persistScrollMap = () => {
      scrollMap.current.set(pathname, window.scrollY);
      saveScrollMap(scrollMap.current);
    };

    window.addEventListener("pagehide", persistScrollMap);

    return () => {
      window.removeEventListener("pagehide", persistScrollMap);
      persistScrollMap();
    };
  }, [pathname]);

  // When pathname changes, either restore (back/forward) or jump to top (new nav)
  useLayoutEffect(() => {
    if (navType === "POP") {
      // Back / forward button — restore saved position
      const saved = scrollMap.current.get(pathname) ?? 0;
      window.scrollTo({ top: saved, behavior: "auto" });
    } else {
      // Normal link click / programmatic navigation — go to top
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, navType]);

  return null;
}

export default ScrollManager;
