import React, { useRef, useCallback } from "react";

function useThrottle() {
  const throttleSeed = useRef(null);

  const throttleFunction = useCallback((func, delay = 200) => {
    if (!throttleSeed.current) {
      func();
      throttleSeed.current = setTimeout(() => {
        throttleSeed.current = null;
      }, delay);
    }
  }, []);

  return throttleFunction;
}

export default useThrottle;
