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
        'w-full rounded-2xl border-2 bg-cream p-4 text-left transition-all',
        'hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#1F2937]',
        selected 
          ? 'border-yellow bg-yellow/20 shadow-[2px_2px_0_0_#1F2937]' 
          : 'border-dark/20 hover:border-dark/40',
      ].join(' ')}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow shadow-[1px_1px_0_0_#1F2937]">
        <type.Icon size={20} className="text-dark" />
      </div>
      <div className="text-sm font-bold text-dark">{type.title}</div>
      <div className="mt-1 text-xs text-dark/60">{type.subtitle}</div>
    </button>
  );
}
