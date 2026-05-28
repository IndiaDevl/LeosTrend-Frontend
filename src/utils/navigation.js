import { flushSync } from "react-dom";

export function scrollToPageStart() {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const mainElement = document.querySelector(".main");
  if (mainElement && "scrollTop" in mainElement) {
    mainElement.scrollTop = 0;
  }
}

export function navigateToPageStart(navigate, to, options) {
  if (typeof navigate !== "function") return;

  flushSync(() => {
    navigate(to, options);
  });

  scrollToPageStart();

  requestAnimationFrame(() => {
    scrollToPageStart();
  });
}