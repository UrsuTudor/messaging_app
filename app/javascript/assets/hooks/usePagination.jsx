import React, { useState } from "react";

export default function usePagination() {
  const [pagination, setPagination] = useState({
    endMessage: null,
    page: 1,
    pages: 2,
    loading: false,
  })

  return [pagination, setPagination]
}
