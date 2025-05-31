import React, { useState } from "react";

export default function useScrolling(){
  const [scrollBottom, setScrollBottom] = useState(0);

  return [scrollBottom, setScrollBottom]
}
