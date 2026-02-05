import React from 'react';
import { Header } from '../Common/Header';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
