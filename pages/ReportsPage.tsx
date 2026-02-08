
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Database, Evaluation, Student, RevisionStatus } from '../types';
import { getDB } from '../services/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type ReportPeriod = 'SESSION' | 'MONTHLY' | '3MONTHS' | '9MONTHS' | 'YEARLY' | 'CUSTOM';

const ReportsPage: React.FC = () => {
  const [db, setDb] = useState<Database>({ students: [], evaluations: [] });
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>('SESSION');

  useEffect(() => {
    setDb(getDB());
  }, []);

  const sessionEvaluations = db.evaluations.filter(e => e.date === filterDate);
  
  const getFilteredEvaluations = (period: ReportPeriod) => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'CUSTOM') {
      const [year, month] = customMonth.split('-').map(Number);
      return db.evaluations.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });
    }

    switch (period) {
      case 'MONTHLY': startDate.setMonth(now.getMonth() - 1); break;
      case '3MONTHS': startDate.setMonth(now.getMonth() - 3); break;
      case '9MONTHS': startDate.setMonth(now.getMonth() - 9); break;
      case 'YEARLY': startDate.setFullYear(now.getFullYear() - 1); break;
      default: return [];
    }

    return db.evaluations.filter(e => new Date(e.date) >= startDate);
  };

  const calculateAverages = (studentId: string, periodEvals: Evaluation[]) => {
    const studentEvals = periodEvals.filter(e => e.studentId === studentId);
    if (studentEvals.length === 0) return { hifz: 0, behavior: 0, count: 0 };
    
    const hifzAvg = studentEvals.reduce((acc, curr) => acc + curr.hifzScore, 0) / studentEvals.length;
    const behaviorAvg = studentEvals.reduce((acc, curr) => acc + curr.behaviorRating, 0) / studentEvals.length;
    
    return { 
      hifz: hifzAvg.toFixed(1), 
      behavior: behaviorAvg.toFixed(1),
      count: studentEvals.length
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = async () => {
    const el = document.getElementById('report-root');
    if (!el) return;

    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      if (imgHeight > pageHeight) {
        // multiple pages
        let heightLeft = imgHeight - pageHeight;
        while (heightLeft > 0) {
          pdf.addPage();
          position = -heightLeft;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`تقرير-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    }
  };

  const formatCustomMonthDisplay = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  const currentPeriodEvals = getFilteredEvaluations(activePeriod);

  return (
    <div id="report-root" className="space-y-6 pb-10 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold text-slate-700">تقارير المتابعة</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-800 transition shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>طباعة</span>
          </button>

          <button
            onClick={handleSavePDF}
            className="bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-50 transition shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
            </svg>
            <span>حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selection Tabs */}
      <div className="flex overflow-x-auto space-x-2 space-x-reverse pb-2 print:hidden scrollbar-hide">
        {[
          { id: 'SESSION', label: 'تقرير الجلسة' },
          { id: 'MONTHLY', label: 'شهري' },
          { id: '3MONTHS', label: '3 أشهر' },
          { id: '9MONTHS', label: '9 أشهر' },
          { id: 'YEARLY', label: 'سنوي' },
          { id: 'CUSTOM', label: 'مخصص' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePeriod(tab.id as ReportPeriod)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activePeriod === tab.id 
                ? 'bg-emerald-700 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom Month Picker Styled UI */}
      {activePeriod === 'CUSTOM' && (
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl space-y-3 print:hidden animate-fadeIn">
          <div className="flex items-center space-x-2 space-x-reverse text-amber-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-bold">تقرير شهر محدد</span>
          </div>
          
          <label className="relative block group">
            <div className="w-full bg-white border-2 border-amber-200 rounded-2xl p-4 flex justify-between items-center cursor-pointer group-hover:bg-amber-100 transition shadow-sm active:scale-[0.98]">
              <span className="text-lg font-bold text-slate-700 quran-font">
                 {formatCustomMonthDisplay(customMonth)}
              </span>
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Hidden native picker triggered by click on label */}
            <input
              type="month"
              value={customMonth}
              onChange={e => setCustomMonth(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
          <p className="text-[10px] text-amber-600 text-center font-medium italic">اضغط على التاريخ أعلاه لفتح الروزنامة واختيار الشهر</p>
        </div>
      )}

      {activePeriod === 'SESSION' ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
          <div className="flex justify-between items-center mb-6 print:mb-8">
            <h3 className="font-bold text-lg text-slate-800 quran-font">تقرير الجلسة اليومية</h3>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 print:hidden"
            />
            <span className="hidden print:block text-slate-600 font-bold">{filterDate}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider print:bg-emerald-50 print:text-emerald-900">
                  <th className="p-3 rounded-tr-lg">الطالب</th>
                  <th className="p-3">الحفظ</th>
                  <th className="p-3">المراجعة</th>
                  <th className="p-3">السلوك</th>
                  <th className="p-3 rounded-tl-lg text-center print:hidden">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.students.map(student => {
                  const evalItem = sessionEvaluations.find(e => e.studentId === student.id);
                  return (
                    <tr key={student.id} className="text-sm">
                      <td className="p-3 font-medium text-slate-800">{student.name}</td>
                      <td className="p-3">
                        {evalItem ? (
                          <span className="font-bold text-emerald-700">{evalItem.hifzScore}</span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-slate-500">
                        {evalItem?.revisionStatus || '-'}
                      </td>
                      <td className="p-3 text-amber-500 font-bold">
                        {evalItem ? '★'.repeat(evalItem.behaviorRating) : '-'}
                      </td>
                      <td className="p-3 text-center print:hidden">
                        {evalItem ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs">تم التقييم</span>
                        ) : (
                          <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-xs">معلق</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
          <div className="mb-6 print:mb-8 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-emerald-900 quran-font">
                تقرير {
                  activePeriod === 'MONTHLY' ? 'شهري' : 
                  activePeriod === '3MONTHS' ? '3 أشهر' : 
                  activePeriod === '9MONTHS' ? '9 أشهر' : 
                  activePeriod === 'YEARLY' ? 'سنوي' : 
                  `مخصص (${formatCustomMonthDisplay(customMonth)})`
                }
              </h3>
              <p className="text-slate-400 text-sm mt-1">متوسطات الأداء للفترة المختارة</p>
            </div>
            {activePeriod === 'CUSTOM' && <span className="hidden print:block text-slate-600 font-bold">{formatCustomMonthDisplay(customMonth)}</span>}
          </div>

          <div className="grid gap-4">
            {db.students.map(student => {
              const avgs = calculateAverages(student.id, currentPeriodEvals);
              return (
                <div key={student.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white print:border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-800">{student.name}</span>
                    <span className="text-xs text-slate-400">إجمالي التقييمات: {avgs.count}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-700 font-medium">متوسط الحفظ</span>
                        <span className="font-bold">{avgs.hifz} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(Number(avgs.hifz) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-600 font-medium">متوسط السلوك</span>
                        <span className="font-bold">{avgs.behavior} / 5</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(Number(avgs.behavior) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {currentPeriodEvals.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              لا توجد بيانات كافية للفترة المختارة
            </div>
          )}
        </div>
      )}

      {/* Visual Chart - Hidden in print */}
      {activePeriod !== 'SESSION' && currentPeriodEvals.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 print:hidden">
          <h3 className="font-bold text-lg text-slate-800 mb-6">مخطط أداء الحفظ (المتوسط)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={db.students.map(s => ({ 
                 name: s.name.split(' ')[0], 
                 hifz: calculateAverages(s.id, currentPeriodEvals).hifz 
               }))}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} />
                 <YAxis domain={[0, 10]} fontSize={12} tick={{fill: '#64748b'}} />
                 <Tooltip />
                 <Bar dataKey="hifz" fill="#047857" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="print:hidden h-2"></div>
    </div>
  );
};

export default ReportsPage;
