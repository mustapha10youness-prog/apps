
import React, { useState, useEffect } from 'react';
import { getDB } from '../services/db';
import { Database, Student } from '../types';
// Note: removed external AI dependency to support offline mode.

const Dashboard: React.FC = () => {
  const [db, setDb] = useState<Database>({ students: [], evaluations: [] });
  const [insight, setInsight] = useState<string>('جاري تحليل البيانات...');

  useEffect(() => {
    const data = getDB();
    setDb(data);
    generateSmartInsight(data);
  }, []);

  const generateSmartInsight = (data: Database) => {
    if (data.students.length === 0) {
      setInsight('ابدأ بإضافة الطلاب لبناء خطة تحفيظ متميزة.');
      return;
    }

    // Offline heuristic summary (no external AI).
    const lastEvals = data.evaluations.slice(-10);
    if (lastEvals.length === 0) {
      setInsight('لا توجد بيانات كافية، استمر بتسجيل التقييمات اليومية.');
      return;
    }

    const lowHifz = lastEvals.filter(e => e.hifzScore <= 4).length;
    const avgHifz = (lastEvals.reduce((a, b) => a + b.hifzScore, 0) / lastEvals.length).toFixed(1);

    if (Number(avgHifz) < 5) {
      setInsight(`متوسط الحفظ ${avgHifz} — ركز على مراجعات قصيرة ومكثفة للطلاب الأضعف (${lowHifz} حالات أخيرة).`);
    } else {
      setInsight(`متوسط الحفظ ${avgHifz} — استمر في النظام الحالي مع تعزيز المراجعة الدورية.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-islamic p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 quran-font">مرحباً بك يا معلم الخير</h2>
          <p className="text-emerald-100 text-sm mb-4">"خياركم من تعلم القرآن وعلمه"</p>
          <div className="flex space-x-4 space-x-reverse mt-6">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <span className="block text-xl font-bold">{db.students.length}</span>
              <span className="text-[10px] uppercase text-emerald-200">طالباً</span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <span className="block text-xl font-bold">{db.evaluations.length}</span>
              <span className="text-[10px] uppercase text-emerald-200">تقييماً</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 blur-xl"></div>
      </div>

      {/* AI Smart Insight */}
      <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl shadow-sm flex items-start space-x-4 space-x-reverse animate-fadeIn">
        <div className="bg-amber-100 p-3 rounded-2xl">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-amber-800 text-sm mb-1">توجيه ذكي</h3>
          <p className="text-amber-900/70 text-sm leading-relaxed">{insight}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">أحدث التقييمات</h3>
          <span className="text-emerald-700 text-sm font-medium">عرض الكل</span>
        </div>
        <div className="grid gap-3">
          {db.evaluations.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
               لا يوجد نشاط مسجل بعد
            </div>
          ) : (
            db.evaluations.slice(-3).reverse().map(e => {
              const student = db.students.find(s => s.id === e.studentId);
              return (
                <div key={e.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                       {student?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{student?.name}</p>
                      <p className="text-[10px] text-slate-400">{e.date}</p>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-bold text-sm">
                    {e.hifzScore} / 10
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Access Menu */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group active:scale-95 transition">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:bg-emerald-700 group-hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-600">تسجيل غياب</span>
        </button>
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group active:scale-95 transition">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-600">خطة الأسبوع</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
