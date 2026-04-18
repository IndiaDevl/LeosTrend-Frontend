import { useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";

/**
 * Layout
 * Central layout wrapper placed around <Routes> inside <Router>.
 * - Reads the current pathname via useLocation
 * - Passes it as `pageKey` to PageTransition so every route change
 *   triggers a fresh entrance animation
 * - Any shared page UI (loading skeletons, banners) can be added here
 */
function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <PageTransition pageKey={pathname}>
      {children}
    </PageTransition>
  );
}

export default Layout;
