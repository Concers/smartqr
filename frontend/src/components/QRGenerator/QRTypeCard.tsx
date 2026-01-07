import { LucideIcon } from 'lucide-react';

export type QRType = {
  key: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
};

export function QRTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: QRType;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type.key)}
      className={[
        'w-full rounded-xl border bg-white p-4 text-left shadow-sm transition',
        'hover:shadow-md',
        selected ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200',
      ].join(' ')}
    >
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <type.Icon size={18} />
      </div>
      <div className="text-sm font-semibold text-slate-900">{type.title}</div>
      <div className="mt-1 text-xs text-slate-500">{type.subtitle}</div>
    </button>
  );
}
