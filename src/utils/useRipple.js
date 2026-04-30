import { useCallback } from "react";

/**
 * useRipple — attaches a luxury ink-ripple on touch/click.
 * Usage:
 *   const ripple = useRipple();
 *   <button onPointerDown={ripple} ...>
 */
export default function useRipple() {
  return useCallback((e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY || rect.top  + rect.height / 2) - rect.top;

    const dot = document.createElement("span");
    dot.className = "ripple-dot";
    dot.style.left = x + "px";
    dot.style.top  = y + "px";
    el.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove(), { once: true });
  }, []);
}
