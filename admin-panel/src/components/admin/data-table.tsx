import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T extends { id?: string; _id?: string }> = {
  title: string;
  description?: string;
  columns: DataColumn<T>[];
  rows: T[];
  totalRows?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  emptyDescription: string;
  rowHref?: (row: T) => string | undefined;
  className?: string;
};

export function DataTable<T extends { id?: string; _id?: string }>({
  title,
  description,
  columns,
  rows = [], // Default to empty array
  totalRows,
  page,
  pageSize,
  onPageChange,
  emptyTitle,
  emptyDescription,
  rowHref,
  className,
}: DataTableProps<T>) {
  const safeRows = rows || [];
  const actualTotalRows = totalRows ?? safeRows.length;
  const totalPages = Math.max(1, Math.ceil(actualTotalRows / pageSize));
  
  // If we passed totalRows, it means server-side pagination, so we don't slice.
  const isServerPagination = totalRows !== undefined;
  const pageRows = isServerPagination ? safeRows : safeRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className={cn("rounded-2xl shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {safeRows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.id || row._id}>
                    {columns.map((column, columnIndex) => {
                      const cell = (
                        <TableCell key={column.key}>
                          {column.render(row)}
                        </TableCell>
                      );
                      const href = rowHref?.(row);
                      if (columnIndex === 0 && href) {
                        return (
                          <TableCell key={column.key} className="font-medium">
                            <Link to={href} className="hover:text-primary">
                              {column.render(row)}
                            </Link>
                          </TableCell>
                        );
                      }
                      return cell;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, actualTotalRows)} of{" "}
                {actualTotalRows} rows
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft data-icon="inline-start" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                  <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
