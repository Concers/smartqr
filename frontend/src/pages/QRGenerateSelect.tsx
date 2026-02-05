import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, Image as ImageIcon, Link as LinkIcon, UserSquare2, Video, Wifi, CreditCard, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../components/Layout/AdminLayout';

type QRTypeKey = 'website' | 'pdf' | 'links' | 'vcard' | 'video' | 'images' | 'wifi' | 'business-card';

type QRType = {
  key: QRTypeKey;
  title: string;
  subtitle: string;
  Icon: any;
};

export default function QRGenerateSelectPage() {
  const navigate = useNavigate();

  const types: QRType[] = useMemo(
    () => [
      { key: 'website', title: 'İnternet sitesi', subtitle: "Bir web sitesi URL'sine bağlantı", Icon: Globe },
      { key: 'pdf', title: 'PDF', subtitle: 'PDF göster', Icon: FileText },
      { key: 'links', title: 'Sosyal Medya', subtitle: 'Sosyal medya hesaplarını paylaşın', Icon: LinkIcon },
      { key: 'vcard', title: 'vCard', subtitle: 'Elektronik kartvizit', Icon: UserSquare2 },
      { key: 'business-card', title: 'İş Kartı', subtitle: 'Profesyonel iş kartı oluşturun', Icon: CreditCard },
      { key: 'video', title: 'Video', subtitle: 'Bir video göster', Icon: Video },
      { key: 'images', title: 'Görsel', subtitle: 'Görsel yükle veya link ver', Icon: ImageIcon },
      { key: 'wifi', title: 'WiFi', subtitle: 'Bir Wi‑Fi ağına bağlanın', Icon: Wifi },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <div className="text-2xl font-bold text-slate-900">QR Oluştur</div>
              <div className="text-sm text-slate-500 mt-1">Lütfen bir QR türü seçin.</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    if (t.key === 'business-card') {
                      navigate('/qr/generate/business-card');
                    } else {
                      navigate(`/qr/generate/${t.key}`);
                    }
                  }}
                  className="text-left p-4 rounded-xl border-2 cursor-pointer transition-all border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                >
                  <t.Icon className="w-8 h-8 text-slate-700 mb-3" />
                  <h3 className="font-semibold text-slate-900">{t.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                    Devam
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
