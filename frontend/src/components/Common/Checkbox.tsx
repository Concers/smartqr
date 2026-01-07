import React from 'react';

export type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({ checked = false, indeterminate, onChange, disabled, className }: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      className={[
        'h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className || '',
      ].join(' ')}
    />
  );
}
