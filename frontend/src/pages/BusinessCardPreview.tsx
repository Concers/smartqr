import BusinessCardPhone from '../components/BusinessCard/BusinessCardPhone';

export default function BusinessCardPreview() {
  const demoData = {
    name: 'Ahmet Yılmaz',
    title: 'Pazarlama Müdürü',
    company: 'netqr.io',
    email: 'ahmet@netqr.io',
    phone: '+90 555 123 4567',
    website: 'netqr.io',
    address: 'İstanbul, Türkiye',
    linkedin: 'linkedin.com/in/ahmetyilmaz',
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-8">
      <BusinessCardPhone data={demoData} />
    </div>
  );
}
