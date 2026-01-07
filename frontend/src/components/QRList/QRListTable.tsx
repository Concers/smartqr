import { useMemo, useState } from 'react';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { Table, Column } from '../Common/Table';
import { Checkbox } from '../Common/Checkbox';

export type QRListItem = {
  id: string;
  shortCode: string;
  qrCodeUrl: string;
  qrCodeImageUrl?: string;
  destinationUrl: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
};

export type QRListTableProps = {
  data: QRListItem[];
  loading?: boolean;
  onEdit: (item: QRListItem) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete?: (ids: string[]) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearchChange: (q: string) => void;
};

export function QRListTable({
  data,
  loading,
  onEdit,
  onToggleActive,
  onDelete,
  page,
  limit,
  total,
  onPageChange,
  onSearchChange,
}: QRListTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const columns: Column<QRListItem>[] = useMemo(
    () => [
      {
        key: 'select',
        header: (
          <Checkbox
            checked={selectedIds.size === data.length && data.length > 0}
            indeterminate={selectedIds.size > 0 && selectedIds.size < data.length}
            onChange={(checked: boolean) => {
              if (checked) setSelectedIds(new Set(data.map((i) => i.id)));
              else setSelectedIds(new Set());
            }}
          />
        ),
        render: (row) => (
          <Checkbox
            checked={selectedIds.has(row.id)}
            onChange={(checked: boolean) => {
              const set = new Set(selectedIds);
              if (checked) set.add(row.id);
              else set.delete(row.id);
              setSelectedIds(set);
            }}
          />
        ),
      },
      {
        key: 'shortCode',
        header: 'Short Code',
        render: (row) => (
          <div className="font-mono text-sm font-medium text-slate-900">{row.shortCode}</div>
        ),
      },
      {
        key: 'destinationUrl',
        header: 'Hedef URL',
        render: (row) => (
          <a
            href={row.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-[200px] truncate text-sm text-blue-600 hover:underline"
            title={row.destinationUrl}
          >
            {row.destinationUrl}
          </a>
        ),
      },
      {
        key: 'createdAt',
        header: 'Oluşturulma',
        render: (row) => new Date(row.createdAt).toLocaleDateString('tr-TR'),
      },
      {
        key: 'expiresAt',
        header: 'Bitiş',
        render: (row) => (row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('tr-TR') : '-'),
      },
      {
        key: 'isActive',
        header: 'Durum',
        render: (row) => (
          <button
            onClick={() => onToggleActive(row.id, !row.isActive)}
            className={[
              'rounded-full px-2 py-1 text-xs font-medium',
              row.isActive
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {row.isActive ? 'Aktif' : 'Pasif'}
          </button>
        ),
      },
      {
        key: 'actions',
        header: 'İşlemler',
        render: (row) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
              Düzenle
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open(row.qrCodeUrl, '_blank')}>
              QR
            </Button>
          </div>
        ),
      },
    ],
    [data, selectedIds, onEdit, onToggleActive]
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Ara..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />
        {selectedIds.size > 0 && onDelete ? (
          <Button variant="danger" onClick={() => onDelete(Array.from(selectedIds))}>
            {selectedIds.size} seçiliyi sil
          </Button>
        ) : null}
      </div>

      <Table columns={columns} data={data} rowKey={(r) => r.id} />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {(page - 1) * limit + 1}-{Math.min(page * limit, total)} / {total}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              Önceki
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
