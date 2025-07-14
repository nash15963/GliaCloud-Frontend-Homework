import { useEffect, useRef, useCallback } from 'react';
import { throttle } from '../utils/throttle';

interface Props {
  triggerReload: boolean | number | null | undefined;
  throttleMs?: number; // Throttle delay in milliseconds, default 100ms
}

// Pure function to check if scroll is needed
const shouldScroll = (containerRect: DOMRect, activeItemRect: DOMRect): boolean => {
  const isAboveView = activeItemRect.top < containerRect.top;
  const isBelowView = activeItemRect.bottom > containerRect.bottom;
  return isAboveView || isBelowView;
};

// Pure function to calculate scroll position
const calculateScrollPosition = (
  activeItemOffsetTop: number,
  containerHeight: number,
  activeItemHeight: number
): number => {
  return activeItemOffsetTop - containerHeight / 2 + activeItemHeight / 2;
};

/**
 * Custom hook for auto-scrolling to the currently playing item with throttling
 * @param triggerReload - Trigger value that causes scroll check
 * @param throttleMs - Throttle delay in milliseconds (default: 100ms)
 * @returns Object containing containerRef and activeItemRef
 */
export const useAutoScroll = ({ triggerReload, throttleMs = 4000 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Create the scroll function
  const performScroll = useCallback(() => {
    if (!activeItemRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const activeItem = activeItemRef.current;

    const containerRect = container.getBoundingClientRect();
    const activeItemRect = activeItem.getBoundingClientRect();

    if (shouldScroll(containerRect, activeItemRect)) {
      const activeItemOffsetTop = activeItem.offsetTop;
      const containerHeight = container.clientHeight;
      const activeItemHeight = activeItem.clientHeight;
      const targetScrollTop = calculateScrollPosition(
        activeItemOffsetTop,
        containerHeight,
        activeItemHeight
      );

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, []);

  // Create throttled version of scroll function
  const throttledScroll = useCallback(
    throttle(performScroll, throttleMs),
    [performScroll, throttleMs]
  );

  useEffect(() => {
    // Only trigger scroll if triggerReload has a meaningful value
    if (triggerReload !== null && triggerReload !== undefined && triggerReload !== false) {
      throttledScroll();
    }
  }, [triggerReload]);

  return {
    containerRef,
    activeItemRef
  };
};