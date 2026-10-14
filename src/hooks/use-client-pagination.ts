"use client";

import { useState } from "react";

export function useClientPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(items.length / pageSize);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageCount,
    pageItems: items.slice(startIndex, startIndex + pageSize),
    setPage,
    resetPage: () => setPage(1),
  };
}
