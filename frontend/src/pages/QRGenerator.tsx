import React, { useState } from 'react';
import { ArrowLeft, Download, Link as LinkIcon, Calendar, Code, ChevronRight, QrCode } from 'lucide-react';

export default function ModernQRGenerator() {
  const [url, setUrl] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">QR Kod Oluştur</h1>
              <p className="text-xs text-slate-500 font-medium">Akıllı QR Çözümleri</p>
            </div>
          </div>
          {/* Stepper (Simplified) */}
          <div className="hidden md:flex items-center gap-2 text-sm">
             <span className="text-slate-400">Tür Seç</span>
             <ChevronRight className="w-4 h-4 text-slate-300" />
             <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">İçerik</span>
             <ChevronRight className="w-4 h-4 text-slate-300" />
             <span className="text-slate-400">Tasarla</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SOL PANEL: Form Alanı */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-800">İçeriğinizi Ekleyin</h2>
            <p className="text-slate-500">QR kodunuzun yönlendireceği hedefi ve detayları belirleyin.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            
            {/* URL Input Group */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Hedef URL
              </label>
              <input 
                type="url" 
                placeholder="https://ornek-websitesi.com" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Özel Kod (Opsiyonel)
                </label>
                <input 
                  type="text" 
                  placeholder="kampanya-2024" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Bitiş Tarihi
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none text-slate-500"
                />
              </div>
            </div>

            <div className="pt-4">
               <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                 QR Kodu Oluştur
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Geri Dön
            </button>
            <button className="text-slate-500 font-medium hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Tasarımı Atla
            </button>
          </div>
        </div>

        {/* SAĞ PANEL: Canlı Önizleme */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl shadow-slate-300 transform rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-slate-800">
              <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] flex flex-col relative">
                
                {/* Mockup Top Bar */}
                <div className="h-6 w-full flex justify-center items-center mt-2">
                    <div className="h-1.5 w-16 bg-slate-200 rounded-full"></div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 text-center space-y-6">
                  
                  <div className="w-64 h-64 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 p-4">
                    {/* Placeholder for QR */}
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-white/20">
                      <QrCode className="w-24 h-24 opacity-20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Canlı Önizleme</h3>
                    <p className="text-slate-400 text-sm">
                      {url ? "Hedef: " + url : "Bağlantı girildiğinde QR kodunuz burada belirecek."}
                    </p>
                  </div>
                </div>

                {/* Mockup Bottom Action */}
                <div className="p-6 bg-white border-t border-slate-100">
                  <button className="w-full bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> İndir (PNG)
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
