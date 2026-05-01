import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pagination } from "./Pagination";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  keyExtractor?: (row: T) => string;
  emptyMessage?: string;
  serverSide?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  currentPage: controlledPage,
  totalItems: controlledTotal,
  onPageChange,
  onSort,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  keyExtractor,
  emptyMessage = "No data available",
  serverSide = false,
}: DataTableProps<T>) {
  const [localPage, setLocalPage] = useState(1);
  const [localSortKey, setLocalSortKey] = useState<string | null>(null);
  const [localSortDir, setLocalSortDir] = useState<"asc" | "desc">("asc");

  const page = controlledPage ?? localPage;
  const activeSortKey = controlledSortKey ?? localSortKey;
  const activeSortDir = controlledSortDirection ?? localSortDir;

  const handleSort = (key: string) => {
    if (onSort) {
      const newDir = activeSortKey === key && activeSortDir === "asc" ? "desc" : "asc";
      onSort(key, newDir);
    } else {
      const newDir = localSortKey === key && localSortDir === "asc" ? "desc" : "asc";
      setLocalSortKey(key);
      setLocalSortDir(newDir);
    }
  };

  const sortedData = useMemo(() => {
    if (serverSide || !activeSortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[activeSortKey];
      const bVal = b[activeSortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return activeSortDir === "asc" ? cmp : -cmp;
    });
  }, [data, activeSortKey, activeSortDir, serverSide]);

  const totalItems = controlledTotal ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const displayData = serverSide
    ? sortedData
    : sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (activeSortKey !== columnKey) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return activeSortDir === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[12px] border border-border bg-theme-bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.5px] text-theme-text-dim",
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 font-semibold text-[12px] uppercase tracking-[0.5px] text-theme-text-dim"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                      <SortIcon columnKey={col.key} />
                    </Button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-theme-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((row, idx) => (
                <tr
                  key={keyExtractor ? keyExtractor(row) : idx}
                  className="border-b border-border transition-colors hover:bg-theme-bg-hover"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-5 py-3.5", col.className)}>
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
