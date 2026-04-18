import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

function ScrollUpButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId = null;
    let lastVisible = false;

    const onScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const nextVisible = scrollTop > 420;

        if (nextVisible !== lastVisible) {
          lastVisible = nextVisible;
          setIsVisible(nextVisible);
        }

        rafId = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`scroll-up-btn ${isVisible ? "visible" : ""}`}
      onClick={handleScrollTop}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <span className="scroll-up-btn-core">
        <FaArrowUp />
      </span>
    </button>
  );
}

export default ScrollUpButton;
