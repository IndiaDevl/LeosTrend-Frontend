import { motion } from "framer-motion";

/**
 * PageTransition
 * Wraps page content with a smooth fade + gentle upward slide.
 *
 * Receives `pageKey` (typically the pathname) so React treats
 * each route as a distinct element and re-runs the animation
 * every time the route changes.
 */
function PageTransition({ pageKey, children }) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
