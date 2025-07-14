/**
 * Creates a throttled version of a function that will only execute at most once
 * during the specified time window.
 * 
 * @param func - The function to throttle
 * @param delay - The throttle delay in milliseconds
 * @returns A throttled version of the input function
 */
export const throttle = <TArgs extends readonly unknown[], TReturn = void>(
  func: (...args: TArgs) => TReturn,
  delay: number
): ((...args: TArgs) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecuted = 0;

  return (...args: TArgs): void => {
    const now = Date.now();
    
    if (now - lastExecuted >= delay) {
      // Execute immediately if enough time has passed
      lastExecuted = now;
      func(...args);
    } else {
      // Schedule execution for later if within throttle window
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const remaining = delay - (now - lastExecuted);
      timeoutId = setTimeout(() => {
        lastExecuted = Date.now();
        func(...args);
        timeoutId = null;
      }, remaining);
    }
  };
};