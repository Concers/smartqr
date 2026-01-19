import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export type ChartProps = {
  title?: string;
  children?: React.ReactNode;
};

export function Chart({ title, children }: ChartProps) {
  return (
    <Card className="border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg font-bold text-dark">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? 'pt-0' : ''}>
        <div className="text-dark/70">{children || 'Chart placeholder'}</div>
      </CardContent>
    </Card>
  );
}
