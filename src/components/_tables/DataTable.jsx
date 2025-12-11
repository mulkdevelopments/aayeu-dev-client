"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * DataTable Component
 *
 * @param {Array} data - Table data (array of objects)
 * @param {Array} columns - [{ key, header, render?, className? }]
 * @param {Function} actions - function(row) => JSX for action buttons
 * @param {String|JSX} emptyText - Message or component when no data
 * @param {JSX} headerContent - Custom JSX above the table (filters, search, etc.)
 * @param {JSX} footerContent - Custom JSX below the table (pagination, summary, etc.)
 * @param {Boolean} bordered - If true, adds border around the table
 * @param {String} className - Extra classes for wrapper
 * @param {Boolean} loading - If true, show skeleton rows instead of data
 * @param {Number} skeletonRows - How many skeleton rows to show while loading
 */
export default function DataTable({
  data = [],
  columns = [],
  actions,
  emptyText = "No records found.",
  headerContent,
  footerContent,
  bordered = true,
  className = "",
  loading = false,
  skeletonRows = 5,
}) {
  const totalColumns = columns.length + (actions ? 1 : 0);

  return (
    <div
      className={`overflow-x-auto bg-white dark:bg-gray-900 ${
        bordered ? "border rounded-xl shadow-sm" : ""
      } ${className}`}
    >
      {/* Header Section (filters, search, etc.) */}
      {headerContent && (
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
          {headerContent}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            // Skeleton Loader
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {columns.map((col, colIdx) => (
                  <TableCell key={col.key || colIdx} className={col.className}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((row, i) => (
              <TableRow key={row._id || i}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row, i) : row[col.key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    {actions(row, i)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={totalColumns}
                className="text-center py-6 text-gray-500"
              >
                {typeof emptyText === "string" ? (
                  <span>{emptyText}</span>
                ) : (
                  emptyText
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Footer Section (pagination, summary, etc.) */}
      {footerContent && (
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          {footerContent}
        </div>
      )}
    </div>
  );
}
