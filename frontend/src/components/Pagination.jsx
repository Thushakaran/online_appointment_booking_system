import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
  totalElements,
  pageSize,
}) => {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 0) {
      pages.push(
        <button
          key="first"
          onClick={() => onPageChange(0)}
          className="px-3 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-l-lg hover:bg-white/20 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 1) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-white">
            ...
          </span>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            i === currentPage
              ? "text-purple-600 bg-purple-100 border border-purple-300"
              : "text-white bg-white/10 border border-white/20 hover:bg-white/20"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-white">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages - 1)}
          className="px-3 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-r-lg hover:bg-white/20 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
      {/* Page info */}
      <div className="text-sm text-white/80">
        Showing {startItem} to {endItem} of {totalElements} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
            hasPrevious
              ? "text-white bg-white/10 border border-white/20 hover:bg-white/20"
              : "text-white/50 bg-white/5 border border-white/10 cursor-not-allowed"
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex">{renderPageNumbers()}</div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
            hasNext
              ? "text-white bg-white/10 border border-white/20 hover:bg-white/20"
              : "text-white/50 bg-white/5 border border-white/10 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
