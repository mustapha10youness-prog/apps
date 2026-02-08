
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, title }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'الرئيسية' },
    { id: 'EVALUATION', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: 'التقييم' },
    { id: 'STUDENTS', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'الطلاب' },
    { id: 'REPORTS', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z', label: 'التقارير' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-islamic sticky top-0 z-10 p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-amber-100 quran-font tracking-wide">{title}</h1>
          <div className="bg-amber-100/20 p-2 rounded-full">
             <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 shadow-2xl z-10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              activeView === item.id ? 'text-emerald-700 font-bold' : 'text-slate-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-xs">{item.label}</span>
            {activeView === item.id && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
