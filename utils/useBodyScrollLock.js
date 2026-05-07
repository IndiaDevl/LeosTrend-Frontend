import { useEffect } from "react";

let activeLockCount = 0;
let savedScrollY = 0;
let savedBodyStyles = null;
const activeBodyClasses = new Map();

const applyBodyLock = () => {
  if (typeof document === "undefined") return;

  const { body, documentElement } = document;
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

  savedScrollY = window.scrollY;
  savedBodyStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.width = "100%";
  body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : savedBodyStyles.paddingRight;
};

const releaseBodyLock = () => {
  if (typeof document === "undefined" || !savedBodyStyles) return;

  const { body } = document;

  body.style.overflow = savedBodyStyles.overflow;
  body.style.position = savedBodyStyles.position;
  body.style.top = savedBodyStyles.top;
  body.style.width = savedBodyStyles.width;
  body.style.paddingRight = savedBodyStyles.paddingRight;

  window.scrollTo({ top: savedScrollY, left: 0, behavior: "auto" });
  savedBodyStyles = null;
};

const addBodyClass = (bodyClassName) => {
  if (!bodyClassName || typeof document === "undefined") return;

  const currentCount = activeBodyClasses.get(bodyClassName) || 0;
  activeBodyClasses.set(bodyClassName, currentCount + 1);
  document.body.classList.add(bodyClassName);
};

const removeBodyClass = (bodyClassName) => {
  if (!bodyClassName || typeof document === "undefined") return;

  const currentCount = activeBodyClasses.get(bodyClassName);
  if (!currentCount) return;

  if (currentCount === 1) {
    activeBodyClasses.delete(bodyClassName);
    document.body.classList.remove(bodyClassName);
    return;
  }

  activeBodyClasses.set(bodyClassName, currentCount - 1);
};

function useBodyScrollLock(isLocked, bodyClassName) {
  useEffect(() => {
    if (!isLocked || typeof window === "undefined") return undefined;

    if (activeLockCount === 0) {
      applyBodyLock();
    }

    activeLockCount += 1;
    addBodyClass(bodyClassName);

    return () => {
      removeBodyClass(bodyClassName);
      activeLockCount = Math.max(0, activeLockCount - 1);

      if (activeLockCount === 0) {
        releaseBodyLock();
      }
    };
  }, [isLocked, bodyClassName]);
}

export default useBodyScrollLock;