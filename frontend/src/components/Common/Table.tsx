import React from 'react';

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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={["px-4 py-3 font-semibold", c.className || ''].join(' ')}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
                Kayıt yok
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className={["px-4 py-3", c.className || ''].join(' ')}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
