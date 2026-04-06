import { useState, useEffect, useRef } from 'react';

const THRESHOLD = 80; // px to pull before triggering refresh

export function usePullToRefresh(onRefresh, enabled = true) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(null);
  const isPulling = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    function onTouchStart(e) {
      // Only trigger if scrolled to top
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }

    function onTouchMove(e) {
      if (!isPulling.current || startY.current === null) return;
      const dist = e.touches[0].clientY - startY.current;
      if (dist <= 0) { isPulling.current = false; return; }
      // Dampen the pull (rubber band feel)
      const dampened = Math.min(dist * 0.4, THRESHOLD * 1.2);
      setPullDistance(dampened);
      setPulling(dampened > 10);
    }

    function onTouchEnd() {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullDistance >= THRESHOLD) {
        onRefresh();
      }
      setPulling(false);
      setPullDistance(0);
      startY.current = null;
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, onRefresh, pullDistance]);

  return { pulling, pullDistance };
}
