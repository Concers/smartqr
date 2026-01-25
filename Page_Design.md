# UI Modernizasyon Görevi: QR Yönetim Listesi (Data Table)

## Proje Tanımı
Basit listeleme sayfasını; filtreleme, sıralama, arama ve hızlı aksiyon (düzenle/sil/indir) özelliklerine sahip, yüksek yoğunluklu veri sunabilen profesyonel bir **Admin Data Grid** yapısına dönüştürmek istiyoruz.

## Tasarım Dili & UX Hedefleri
* **Zemin:** `bg-slate-50` (Tüm panelle uyumlu).
* **Tablo Yapısı:**
    * "Card" görünümü yerine, verimlilik odaklı **Satır (Row)** yapısı.
    * Başlıklar: `text-xs uppercase font-semibold text-slate-500`.
    * Satırlar: Hover durumunda hafif renk değişimi (`hover:bg-slate-50/50`).
* **Görsel Hiyerarşi:**
    * **QR Adı:** Koyu ve kalın (`text-slate-900`).
    * **URL:** Silik ve küçük (`text-slate-400`), yanında kopyalama butonu.
    * **Durum (Status):** Renkli "Badge"ler (Yeşil: Aktif, Gri: Pasif).
* **Aksiyonlar:** Her satırın sonunda kullanıcıyı yormayan "3 Nokta" menüsü veya açık ikonlar.

---

## Örnek Kod (Reference Implementation)

Not: Bu kod, sayfanın ana içerik alanını (`main`) temsil eder. Header ve Sidebar dışarıdan gelir.

```tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Edit, 
  Trash2, 
  ExternalLink, 
  QrCode,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy
} from 'lucide-react';

export default function QRListPage() {
  // Örnek Veri
  const qrCodes = [
    { id: 1, name: 'Yaz Kampanyası 2026', url: '[https://site.com/yaz](https://site.com/yaz)', type: 'Website', scans: 1240, status: 'active', date: '23 Oca 2026' },
    { id: 2, name: 'Instagram Profil', url: '[https://instagr.am/vario](https://instagr.am/vario)', type: 'Social', scans: 856, status: 'active', date: '21 Oca 2026' },
    { id: 3, name: 'Wifi Giriş - Ofis', url: 'WIFI:S:Ofis;T:WPA;;', type: 'Wifi', scans: 120, status: 'paused', date: '15 Oca 2026' },
    { id: 4, name: 'Menü PDF', url: '[https://site.com/menu.pdf](https://site.com/menu.pdf)', type: 'PDF', scans: 3402, status: 'active', date: '10 Oca 2026' },
    { id: 5, name: 'Kış İndirimi', url: '[https://site.com/kis](https://site.com/kis)', type: 'Website', scans: 45, status: 'archived', date: '01 Oca 2026' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans">
      
      {/* 1. Üst Kontrol Paneli (Toolbar) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Kodlarım</h1>
          <p className="text-sm text-slate-500">Tüm QR kodlarınızı yönetin, düzenleyin ve takip edin.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Arama Çubuğu */}
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
            <input 
              type="text" 
              placeholder="QR Ara..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all shadow-sm"
            />
          </div>
          
          {/* Filtre Butonu */}
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          
          {/* Yeni Oluştur Butonu */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-transform active:scale-95 whitespace-nowrap">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Oluştur</span>
          </button>
        </div>
      </div>

      {/* 2. Ana Tablo Alanı (Data Grid) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">QR Detayı</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tür</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarama</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarih</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qrCodes.map((qr) => (
                <tr key={qr.id} className="group hover:bg-slate-50/80 transition-colors">
                  
                  {/* İsim ve URL */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{qr.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 group/link cursor-pointer">
                          <span className="truncate max-w-[150px]">{qr.url}</span>
                          <Copy className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity hover:text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tür */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {qr.type}
                    </span>
                  </td>

                  {/* Tarama Sayısı */}
                  <td className="py-4 px-6">
                    <div className="text-sm font-semibold text-slate-900">{qr.scans.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Görüntülenme</div>
                  </td>

                  {/* Durum (Badge) */}
                  <td className="py-4 px-6">
                    {qr.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                      </span>
                    )}
                    {qr.status === 'paused' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Duraklatıldı
                      </span>
                    )}
                     {qr.status === 'archived' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Arşiv
                      </span>
                    )}
                  </td>

                  {/* Tarih */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {qr.date}
                    </div>
                  </td>

                  {/* Aksiyon Butonları (Hover'da görünür veya sabit) */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="İstatistikler">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Düzenle">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="İndir">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination (Sayfalama) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <div className="text-sm text-slate-500">
            Toplam <span className="font-medium text-slate-900">24</span> kayıttan <span className="font-medium text-slate-900">1-5</span> arası gösteriliyor
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
      </div>
    </main>
  );
}