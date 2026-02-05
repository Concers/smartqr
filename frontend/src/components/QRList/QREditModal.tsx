import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Common/Modal';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';

export type QREditModalProps = {
  open: boolean;
  onClose: () => void;
  item?: {
    id: string;
    shortCode?: string;
    qrCodeUrl?: string;
    destinationUrl: string;
    expiresAt?: string;
    isActive: boolean;
  };
  onSubmit: (values: { destinationUrl: string; isActive: boolean; expiresAt?: string }) => void;
  loading?: boolean;
};

export function QREditModal({ open, onClose, item, onSubmit, loading }: QREditModalProps) {
  const isVCard = useMemo(() => {
    const u = item?.destinationUrl;
    return typeof u === 'string' && u.toLowerCase().startsWith('data:text/vcard');
  }, [item?.destinationUrl]);

  const toDatetimeLocalValue = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [companyOpen, setCompanyOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);

  const parseVCardFromDataUri = (dataUri: string) => {
    try {
      const commaIndex = dataUri.indexOf(',');
      const meta = commaIndex >= 0 ? dataUri.slice(0, commaIndex) : dataUri;
      const dataPart = commaIndex >= 0 ? dataUri.slice(commaIndex + 1) : '';
      const isBase64 = /;base64/i.test(meta);
      const text = isBase64 ? atob(dataPart) : decodeURIComponent(dataPart);

      const out = {
        firstName: '',
        lastName: '',
        mobile: '',
        phone: '',
        fax: '',
        email: '',
        company: '',
        job: '',
        street: '',
        city: '',
        zip: '',
        state: '',
        country: '',
        website: '',
      };

      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => {
          const upper = line.toUpperCase();

          if (upper.startsWith('N:')) {
            const val = line.slice(2);
            const parts = val.split(';');
            out.lastName = parts[0] || '';
            out.firstName = parts[1] || '';
            return;
          }

          if (upper.startsWith('ORG:')) {
            out.company = line.slice(4);
            return;
          }

          if (upper.startsWith('TITLE:')) {
            out.job = line.slice(6);
            return;
          }

          if (upper.startsWith('EMAIL:')) {
            out.email = line.slice(6);
            return;
          }

          if (upper.startsWith('URL:')) {
            out.website = line.slice(4);
            return;
          }

          if (upper.startsWith('TEL')) {
            const [left, ...rest] = line.split(':');
            const number = rest.join(':');
            const leftUpper = left.toUpperCase();
            if (leftUpper.includes('TYPE=CELL')) out.mobile = number;
            else if (leftUpper.includes('TYPE=FAX')) out.fax = number;
            else out.phone = number;
            return;
          }

          if (upper.startsWith('ADR')) {
            const val = line.split(':').slice(1).join(':');
            const parts = val.split(';');
            out.street = parts[2] || '';
            out.city = parts[3] || '';
            out.state = parts[4] || '';
            out.zip = parts[5] || '';
            out.country = parts[6] || '';
          }
        });

      return out;
    } catch {
      return null;
    }
  };

  const buildVCardDataUri = (v: any) => {
    const first = (v.firstName || '').trim();
    const last = (v.lastName || '').trim();
    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push(`N:${last};${first};;;`);
    const fn = `${first}${first && last ? ' ' : ''}${last}`.trim();
    if (fn) lines.push(`FN:${fn}`);
    if (v.company?.trim()) lines.push(`ORG:${v.company.trim()}`);
    if (v.job?.trim()) lines.push(`TITLE:${v.job.trim()}`);
    if (v.mobile?.trim()) lines.push(`TEL;TYPE=CELL:${v.mobile.trim()}`);
    if (v.phone?.trim()) lines.push(`TEL;TYPE=WORK:${v.phone.trim()}`);
    if (v.fax?.trim()) lines.push(`TEL;TYPE=FAX:${v.fax.trim()}`);
    if (v.email?.trim()) lines.push(`EMAIL:${v.email.trim()}`);
    const street = (v.street || '').trim();
    const city = (v.city || '').trim();
    const state = (v.state || '').trim();
    const zip = (v.zip || '').trim();
    const country = (v.country || '').trim();
    if (street || city || state || zip || country) {
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
    }
    if (v.website?.trim()) lines.push(`URL:${v.website.trim()}`);
    lines.push('END:VCARD');
    const text = lines.join('\n');
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(text)}`;
  };

  const [destinationUrl, setDestinationUrl] = useState(item?.destinationUrl || '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocalValue(item?.expiresAt));

  const [vcard, setVcard] = useState(() => {
    const parsed = item?.destinationUrl ? parseVCardFromDataUri(item.destinationUrl) : null;
    return (
      parsed || {
        firstName: '',
        lastName: '',
        mobile: '',
        phone: '',
        fax: '',
        email: '',
        company: '',
        job: '',
        street: '',
        city: '',
        zip: '',
        state: '',
        country: '',
        website: '',
      }
    );
  });

  useEffect(() => {
    setDestinationUrl(item?.destinationUrl || '');
    setIsActive(item?.isActive ?? true);
    setExpiresAt(toDatetimeLocalValue(item?.expiresAt));
    if (item?.destinationUrl) {
      const parsed = parseVCardFromDataUri(item.destinationUrl);
      if (parsed) setVcard(parsed);
    }
  }, [item?.destinationUrl, item?.isActive, item?.expiresAt, open]);

  const handleSubmit = () => {
    const expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : undefined;
    if (isVCard) {
      onSubmit({
        destinationUrl: buildVCardDataUri(vcard),
        isActive,
        expiresAt: expiresAtIso,
      });
      return;
    }

    onSubmit({ destinationUrl, isActive, expiresAt: expiresAtIso });
  };

  return (
    <Modal open={open} title={isVCard ? 'vCard Düzenle' : 'QR Düzenle'} onClose={onClose}>
      <div className="space-y-4">
        {item?.qrCodeUrl ? (
          <Input label="QR Link (Sabit)" value={item.qrCodeUrl} disabled />
        ) : null}

        {item?.shortCode ? (
          <Input label="Kısa Kod (Sabit)" value={item.shortCode} disabled />
        ) : null}

        {!isVCard ? (
          <Input
            label="Hedef URL"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ad"
                value={vcard.firstName}
                onChange={(e) => setVcard((s: any) => ({ ...s, firstName: e.target.value }))}
              />
              <Input
                label="Soyad"
                value={vcard.lastName}
                onChange={(e) => setVcard((s: any) => ({ ...s, lastName: e.target.value }))}
              />
            </div>

            <Input
              label="Mobil"
              value={vcard.mobile}
              onChange={(e) => setVcard((s: any) => ({ ...s, mobile: e.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telefon"
                value={vcard.phone}
                onChange={(e) => setVcard((s: any) => ({ ...s, phone: e.target.value }))}
              />
              <Input
                label="Fax"
                value={vcard.fax}
                onChange={(e) => setVcard((s: any) => ({ ...s, fax: e.target.value }))}
              />
            </div>

            <Input
              label="E‑posta"
              value={vcard.email}
              onChange={(e) => setVcard((s: any) => ({ ...s, email: e.target.value }))}
            />

            <div className="rounded-lg border border-slate-200">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800"
                onClick={() => setCompanyOpen((v) => !v)}
              >
                <span>Şirket / Ünvan</span>
                <span className="text-slate-500">{companyOpen ? '−' : '+'}</span>
              </button>
              {companyOpen ? (
                <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Şirket"
                    value={vcard.company}
                    onChange={(e) => setVcard((s: any) => ({ ...s, company: e.target.value }))}
                  />
                  <Input
                    label="Ünvan"
                    value={vcard.job}
                    onChange={(e) => setVcard((s: any) => ({ ...s, job: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800"
                onClick={() => setAddressOpen((v) => !v)}
              >
                <span>Adres</span>
                <span className="text-slate-500">{addressOpen ? '−' : '+'}</span>
              </button>
              {addressOpen ? (
                <div className="px-3 pb-3 pt-1 grid grid-cols-1 gap-4">
                  <Input
                    label="Adres"
                    value={vcard.street}
                    onChange={(e) => setVcard((s: any) => ({ ...s, street: e.target.value }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Şehir"
                      value={vcard.city}
                      onChange={(e) => setVcard((s: any) => ({ ...s, city: e.target.value }))}
                    />
                    <Input
                      label="Posta Kodu"
                      value={vcard.zip}
                      onChange={(e) => setVcard((s: any) => ({ ...s, zip: e.target.value }))}
                    />
                  </div>

                  <Input
                    label="Eyalet"
                    value={vcard.state}
                    onChange={(e) => setVcard((s: any) => ({ ...s, state: e.target.value }))}
                  />

                  <Input
                    label="Ülke"
                    value={vcard.country}
                    onChange={(e) => setVcard((s: any) => ({ ...s, country: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800"
                onClick={() => setOtherOpen((v) => !v)}
              >
                <span>Diğer</span>
                <span className="text-slate-500">{otherOpen ? '−' : '+'}</span>
              </button>
              {otherOpen ? (
                <div className="px-3 pb-3 pt-1 grid grid-cols-1 gap-4">
                  <Input
                    label="Website"
                    value={vcard.website}
                    onChange={(e) => setVcard((s: any) => ({ ...s, website: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}

        <Input
          label="Bitiş Tarihi (opsiyonel)"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
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
        <Button disabled={loading || (!isVCard && !destinationUrl.trim())} onClick={handleSubmit}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </Modal>
  );
}
