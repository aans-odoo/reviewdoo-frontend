import { useLayoutEffect, useRef, useState } from "react";

/** One scroll signal for both logos, independent of the sidebar's sticky state. */
export function useLogoHandoff() {
  const headerRef = useRef<HTMLElement>(null);
  const [showSidebarLogo, setShowSidebarLogo] = useState(false);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Account for restored scroll positions before the first paint.
    setShowSidebarLogo(header.getBoundingClientRect().top < 0);
    // Start the handoff as the header leaves the viewport, while its logo
    // still has room to fade. Its fixed geometry keeps the trigger stable.
    const observer = new IntersectionObserver(([entry]) => {
      setShowSidebarLogo(entry.boundingClientRect.top < 0);
    }, { threshold: [0, 1] });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return { headerRef, showSidebarLogo };
}
