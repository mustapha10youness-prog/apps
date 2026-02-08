
import React, { useState, useEffect } from 'react';
import { Student, Evaluation, RevisionStatus } from '../types';
import { getDB, upsertEvaluation, getLastEvaluation } from '../services/db';

const EvaluationPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  useEffect(() => {
    const db = getDB();
    setStudents(db.students);
    
    // Initialize evaluations for this date
    const dailyEvals = db.evaluations.filter(e => e.date === currentDate);
    const evalMap: Record<string, Evaluation> = {};
    dailyEvals.forEach(e => {
      evalMap[e.studentId] = e;
    });
    setEvaluations(evalMap);
    
    if (db.students.length > 0 && !activeStudentId) {
      setActiveStudentId(db.students[0].id);
    }
  }, [currentDate]);

  const updateEvalField = (studentId: string, field: keyof Evaluation, value: any) => {
    const existing = evaluations[studentId] || {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      date: currentDate,
      hifzScore: 10,
      revisionStatus: RevisionStatus.EXCELLENT,
      behaviorRating: 5
    };
    
    const updated = { ...existing, [field]: value };
    setEvaluations(prev => ({ ...prev, [studentId]: updated }));
    upsertEvaluation(updated);
  };

  const handleRepeatLastWeek = (studentId: string) => {
    const last = getLastEvaluation(studentId);
    if (last) {
      const repeated = {
        ...last,
        id: Math.random().toString(36).substr(2, 9),
        date: currentDate
      };
      setEvaluations(prev => ({ ...prev, [studentId]: repeated }));
      upsertEvaluation(repeated);
    } else {
      alert('لا توجد بيانات سابقة لهذا الطالب');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudent = students.find(s => s.id === activeStudentId);
  const activeEval = activeStudentId ? evaluations[activeStudentId] : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Date and Navigation Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <input
            type="date"
            value={currentDate}
            onChange={e => setCurrentDate(e.target.value)}
            className="border-none text-emerald-800 font-bold outline-none cursor-pointer text-lg bg-transparent"
          />
          <div className="text-xs text-slate-400 font-medium">جلسة التقييم الأسبوعي</div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ابحث عن طالب بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pr-10 pl-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>

        {/* Horizontal Student List */}
        <div className="flex overflow-x-auto space-x-3 space-x-reverse pb-2 scrollbar-hide">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setActiveStudentId(student.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeStudentId === student.id
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {student.name}
              </button>
            ))
          ) : (
            <div className="text-xs text-slate-400 py-2 pr-2">لا توجد نتائج للبحث</div>
          )}
        </div>
      </div>

      {activeStudent ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 space-y-8 animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 quran-font">{activeStudent.name}</h2>
              <p className="text-slate-400 text-sm">تعديل تقييم اليوم</p>
            </div>
            <button
              onClick={() => handleRepeatLastWeek(activeStudent.id)}
              className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-100 hover:bg-amber-100 transition"
            >
              تكرار تقييم الأسبوع الماضي
            </button>
          </div>

          {/* Hifz Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-bold text-emerald-900">الحفظ الجديد</label>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xl">
                {activeEval?.hifzScore ?? 10} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={activeEval?.hifzScore ?? 10}
              onChange={e => updateEvalField(activeStudent.id, 'hifzScore', parseFloat(e.target.value))}
              className="w-full h-3 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>ضعيف</span>
              <span>ممتاز</span>
            </div>
          </div>

          {/* Revision Toggle */}
          <div className="space-y-4">
            <label className="text-lg font-bold text-emerald-900">المراجعة</label>
            <div className="grid grid-cols-3 gap-2">
              {[RevisionStatus.EXCELLENT, RevisionStatus.FAIR, RevisionStatus.POOR].map(status => (
                <button
                  key={status}
                  onClick={() => updateEvalField(activeStudent.id, 'revisionStatus', status)}
                  className={`py-3 rounded-xl font-bold border-2 transition-all ${
                    activeEval?.revisionStatus === status
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior Rating */}
          <div className="space-y-4">
            <label className="text-lg font-bold text-emerald-900">السلوك</label>
            <div className="flex justify-center space-x-3 space-x-reverse">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => {
                    updateEvalField(activeStudent.id, 'behaviorRating', rating);
                    if (window.navigator.vibrate) window.navigator.vibrate(20);
                  }}
                  className={`transition-transform active:scale-125 ${
                    (activeEval?.behaviorRating ?? 5) >= rating ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center space-x-3 space-x-reverse">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-emerald-800 text-sm leading-relaxed font-medium">
                يتم حفظ التقييم تلقائياً فور التعديل. يمكنك تصفح التقارير لاحقاً لمتابعة مستوى الطالب.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-slate-100">
          <p className="text-slate-400">يرجى إضافة طلاب أولاً لبدء التقييم</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;
