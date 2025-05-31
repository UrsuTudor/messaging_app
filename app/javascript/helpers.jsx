import React, { useRef } from "react";

const useThrottle = () => {
  const throttleSeed = useRef(null)

  const throttleFunction = useRef((func, delay = 200) => {
    if(!throttleSeed.current){
      func()
      throttleSeed.current = setTimeout(() => {
        throttleSeed.current = null
      }, delay)
    }
  })

  return throttleFunction.current
}

export default useThrottle
