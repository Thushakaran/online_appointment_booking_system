import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
  totalElements,
  pageSize,
}) => {
  if (totalPages <= 1) {
    return null;
  }

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

    if (startPage > 0) {
      pages.push(
        <button
          key="first"
          type="button"
          onClick={() => onPageChange(0)}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors tabular-nums"
        >
          1
        </button>
      );
      if (startPage > 1) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-1.5 text-sm text-slate-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => onPageChange(i)}
          aria-current={i === currentPage ? "page" : undefined}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors tabular-nums ${
            i === currentPage
              ? "text-white bg-indigo-600 border-indigo-600"
              : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-1.5 text-sm text-slate-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key="last"
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors tabular-nums"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 mt-6">
      <div className="text-sm text-slate-500 tabular-nums">
        Showing <span className="font-medium text-slate-800">{startItem}</span> to{" "}
        <span className="font-medium text-slate-800">{endItem}</span> of{" "}
        <span className="font-medium text-slate-800">{totalElements}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
            hasPrevious
              ? "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
              : "text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed"
          }`}
        >
          <FiChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">{renderPageNumbers()}</div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
            hasNext
              ? "text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
              : "text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed"
          }`}
        >
          <span>Next</span>
          <FiChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
