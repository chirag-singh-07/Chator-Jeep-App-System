import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to top on route change so legal pages start at their header. */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};