import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name || undefined;

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        {...props}
        className={[
          'h-10 w-full rounded-md border px-3 text-sm',
          'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-slate-300',
          error ? 'border-rose-300' : '',
          className || '',
        ].join(' ')}
      />
      {error ? <div className="text-sm text-rose-600">{error}</div> : null}
    </div>
  );
}
