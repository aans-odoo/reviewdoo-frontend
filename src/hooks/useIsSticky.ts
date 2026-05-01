// useIsSticky.ts
import { useEffect, useRef, useState } from 'react'

export function useIsSticky<T extends HTMLElement>() {
  const stickyElRef = useRef<T>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const el = stickyElRef.current
    if (!el) return

    // We use a sentinel element placed just above the sticky el.
    // When the sentinel scrolls out of view, the sticky el is "stuck".
    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'position:absolute;height:1px;width:1px;pointer-events:none;'

    el.parentElement?.insertBefore(sentinel, el)

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      {
        threshold: [1],
        // Nudge the root margin up by 1px so the sentinel
        // triggers exactly when the sticky el hits top:0
        rootMargin: '-1px 0px 0px 0px',
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  return { stickyElRef, isSticky }
}
