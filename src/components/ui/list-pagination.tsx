"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ListPaginationProps {
  currentPage: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function ListPagination({
  currentPage,
  pageCount,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
}: ListPaginationProps) {
  if (pageCount < 2) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row"
    >
      <p className="text-center text-xs text-muted-foreground sm:text-left">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {firstItem}–{lastItem}
        </span>{" "}
        of <span className="font-semibold text-foreground">{totalItems}</span>{" "}
        {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span
          aria-live="polite"
          className="min-w-20 text-center text-xs font-medium"
        >
          Page {currentPage} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
          aria-label="Go to next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
