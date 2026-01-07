import React from 'react';

export type ChartProps = {
  title?: string;
  children?: React.ReactNode;
};

export function Chart({ title, children }: ChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {title ? <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div> : null}
      <div className="text-sm text-slate-600">{children || 'Chart placeholder'}</div>
    </div>
  );
}
