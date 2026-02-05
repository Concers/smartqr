type Step = {
  id: number;
  title: string;
};

export function Stepper({ currentStep }: { currentStep: number }) {
  const steps: Step[] = [
    { id: 1, title: 'QR türünü seçin' },
    { id: 2, title: 'İçerik ekleyin' },
    { id: 3, title: 'QR kodunu tasarlayın' },
    { id: 4, title: 'QR kodunu indirin' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
      {steps.map((s, idx) => {
        const done = currentStep > s.id;
        const active = currentStep === s.id;

        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={[
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                done ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600',
              ].join(' ')}
            >
              {s.id}
            </div>
            <div className={active ? 'font-semibold text-slate-900' : ''}>{s.title}</div>
            {idx < steps.length - 1 ? <div className="mx-2 h-px w-8 bg-slate-200" /> : null}
          </div>
        );
      })}
    </div>
  );
}
