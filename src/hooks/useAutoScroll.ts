import { useEffect, useRef } from 'react';

interface Props {
  triggerReload: boolean | number | null | undefined;
}

/**
 * Custom hook for auto-scrolling to the currently playing item
 * @returns Object containing containerRef and activeItemRef
 */
export const useAutoScroll = ({ triggerReload }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeItem = activeItemRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeItemRect = activeItem.getBoundingClientRect();

      const isAboveView = activeItemRect.top < containerRect.top;
      const isBelowView = activeItemRect.bottom > containerRect.bottom;

      if (isAboveView || isBelowView) {
        const activeItemOffsetTop = activeItem.offsetTop;
        const containerHeight = container.clientHeight;
        const activeItemHeight = activeItem.clientHeight;
        const targetScrollTop = activeItemOffsetTop - containerHeight / 2 + activeItemHeight / 2;

        container.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    }
  }, [triggerReload]);

  return {
    containerRef,
    activeItemRef
  };
};