import { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';

export type QREditModalProps = {
  open: boolean;
  onClose: () => void;
  item?: {
    id: string;
    destinationUrl: string;
    isActive: boolean;
  };
  onSubmit: (values: { destinationUrl: string; isActive: boolean }) => void;
  loading?: boolean;
};

export function QREditModal({ open, onClose, item, onSubmit, loading }: QREditModalProps) {
  const [destinationUrl, setDestinationUrl] = useState(item?.destinationUrl || '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  const handleSubmit = () => {
    onSubmit({ destinationUrl, isActive });
  };

  return (
    <Modal open={open} title="QR Düzenle" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="Hedef URL"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Aktif
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button disabled={loading || !destinationUrl.trim()} onClick={handleSubmit}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </Modal>
  );
}
