import { useCallback } from 'react';
import { Mail, Phone, Globe, MapPin, Linkedin, UserPlus } from 'lucide-react';

export interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  linkedin: string;
}

interface BusinessCardPhoneProps {
  data: BusinessCardData;
  scale?: number;
}

const ensureHttps = (url: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export default function BusinessCardPhone({ data, scale = 1 }: BusinessCardPhoneProps) {
  const { name, title, company, email, phone, website, address, linkedin } = data;

  const downloadVCard = useCallback(() => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (title) params.set('title', title);
    if (company) params.set('company', company);
    if (email) params.set('email', email);
    if (phone) params.set('phone', phone);
    if (address) params.set('address', address);
    if (website) params.set('website', website);
    if (linkedin) params.set('linkedin', linkedin);
    window.location.href = `/api/vcard?${params.toString()}`;
  }, [name, title, company, email, phone, website, address, linkedin]);

  return (
    <div 
      className="relative" 
      style={{ width: `${290 * scale}px`, height: `${590 * scale}px`, transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* Outer titanium frame */}
      <div 
        className="absolute inset-0 rounded-[45px]"
        style={{ 
          background: 'linear-gradient(145deg, #4a4a4a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.4), 0 10px 20px -5px rgba(0,0,0,0.2)'
        }}
      />
      
      {/* Inner frame highlight */}
      <div 
        className="absolute inset-[1px] rounded-[44px]"
        style={{ background: 'linear-gradient(180deg, #3d3d3d 0%, #1f1f1f 100%)' }}
      />
      
      {/* Main frame body */}
      <div className="absolute inset-[2px] rounded-[43px] bg-[#1a1a1a]" />
      
      {/* Left side buttons */}
      <div className="absolute left-[-2px] top-[100px] w-[3px] h-[28px] bg-[#2d2d2d] rounded-l-sm" />
      <div className="absolute left-[-2px] top-[145px] w-[3px] h-[55px] bg-[#2d2d2d] rounded-l-sm" />
      <div className="absolute left-[-2px] top-[210px] w-[3px] h-[55px] bg-[#2d2d2d] rounded-l-sm" />
      
      {/* Right side button */}
      <div className="absolute right-[-2px] top-[160px] w-[3px] h-[70px] bg-[#2d2d2d] rounded-r-sm" />
      
      {/* Screen bezel */}
      <div className="absolute top-[8px] left-[8px] right-[8px] bottom-[8px] rounded-[38px] bg-black" />
      
      {/* Actual screen */}
      <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] rounded-[36px] overflow-hidden bg-white">
        {/* Dynamic Island */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[95px] h-[28px] bg-black rounded-full z-30 flex items-center justify-end pr-2.5 gap-2">
          <div className="w-[10px] h-[10px] rounded-full bg-[#0c0c0c] ring-[1.5px] ring-[#1a1a1a]" />
        </div>
        
        <div className="w-full h-full bg-gradient-to-b from-white via-[#fafafa] to-[#f5f5f7] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-transparent" />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl" />
          
          <div className="relative z-10 h-full flex flex-col px-5 pt-14 pb-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center" style={{ boxShadow: '0 15px 30px -8px rgba(99,102,241,0.35)' }}>
                    <span className="text-2xl font-bold text-blue-600">
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-lg font-semibold text-[#0f172a] mb-0.5 tracking-tight">{name || 'İsim Soyisim'}</h1>
              <p className="text-xs font-medium text-blue-600/90 mb-0.5">{title || 'Unvan'}</p>
              <p className="text-[10px] text-[#94a3b8] tracking-wide">{company || 'Şirket'}</p>
            </div>

            <div className="flex justify-center gap-3 mb-5">
              {phone && (
                <a href={`tel:${phone}`} className="group w-10 h-10 rounded-full bg-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ease-out" style={{ boxShadow: '0 4px 15px -4px rgba(0,0,0,0.12)' }}>
                  <Phone className="w-4 h-4 text-[#64748b] group-hover:text-blue-600 transition-colors duration-300" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="group w-10 h-10 rounded-full bg-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ease-out" style={{ boxShadow: '0 4px 15px -4px rgba(0,0,0,0.12)' }}>
                  <Mail className="w-4 h-4 text-[#64748b] group-hover:text-blue-600 transition-colors duration-300" />
                </a>
              )}
              {website && (
                <a href={ensureHttps(website)} target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-full bg-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ease-out" style={{ boxShadow: '0 4px 15px -4px rgba(0,0,0,0.12)' }}>
                  <Globe className="w-4 h-4 text-[#64748b] group-hover:text-blue-600 transition-colors duration-300" />
                </a>
              )}
              {linkedin && (
                <a href={ensureHttps(linkedin)} target="_blank" rel="noopener noreferrer" className="group w-10 h-10 rounded-full bg-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ease-out" style={{ boxShadow: '0 4px 15px -4px rgba(0,0,0,0.12)' }}>
                  <Linkedin className="w-4 h-4 text-[#64748b] group-hover:text-blue-600 transition-colors duration-300" />
                </a>
              )}
            </div>

            <div className="flex-1 rounded-2xl bg-white p-4" style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
              <div className="space-y-1">
                {email && (
                  <a href={`mailto:${email}`} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/80 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest mb-0.5">E-posta</p>
                      <p className="text-[11px] text-[#0f172a] truncate font-medium">{email}</p>
                    </div>
                  </a>
                )}

                {phone && (
                  <a href={`tel:${phone}`} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/80 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest mb-0.5">Telefon</p>
                      <p className="text-[11px] text-[#0f172a] truncate font-medium">{phone}</p>
                    </div>
                  </a>
                )}

                {address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/80 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest mb-0.5">Konum</p>
                      <p className="text-[11px] text-[#0f172a] font-medium break-words">{address}</p>
                    </div>
                  </a>
                )}

                {website && (
                  <a href={ensureHttps(website)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100/80 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest mb-0.5">Web Sitesi</p>
                      <p className="text-[11px] text-[#0f172a] truncate font-medium">{website}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button onClick={downloadVCard} className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 transition-all duration-300 ease-out" style={{ boxShadow: '0 10px 25px -8px rgba(99,102,241,0.5)' }}>
                <div className="relative py-3 flex items-center justify-center gap-2 font-semibold text-white text-sm">
                  <UserPlus className="w-4 h-4" />
                  Rehbere Ekle
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
