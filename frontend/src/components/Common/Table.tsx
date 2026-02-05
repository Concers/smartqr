import React from "react"
import { cn } from "../../lib/utils"
import {
  Table as ShadcnTable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table"

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export type TableProps<T> = {
  columns: Array<Column<T>>;
  data: Array<T>;
  rowKey: (row: T) => string;
};

export function Table<T>({ columns, data, rowKey }: TableProps<T>) {
  return (
    <div className="rounded-md border">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("font-semibold", c.className)}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-24 text-center text-muted-foreground"
              >
                Kayıt yok
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
