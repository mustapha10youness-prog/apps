
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getDB, addStudent, updateStudent, deleteStudent, saveDB } from '../services/db';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });

  useEffect(() => {
    refreshStudents();
  }, []);

  const refreshStudents = () => {
    setStudents(getDB().students);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        phone: student.phone,
        parentName: student.parentName,
        parentPhone: student.parentPhone
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', phone: '', parentName: '', parentPhone: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      const newStudent: Student = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
      };
      addStudent(newStudent);
    }
    setIsModalOpen(false);
    refreshStudents();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع تقييماته أيضاً.')) {
      deleteStudent(id);
      refreshStudents();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-700">قائمة الطلاب ({students.length})</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-800 transition shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>إضافة طالب</span>
          </button>

          <button
            onClick={() => {
              const db = getDB();
              const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `madrassa-data-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            تصدير JSON
          </button>

          <label className="bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm cursor-pointer">
            استيراد JSON
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const text = await f.text();
                  const parsed = JSON.parse(text);
                  if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.evaluations)) {
                    saveDB(parsed);
                    refreshStudents();
                    alert('تم استيراد البيانات بنجاح.');
                  } else {
                    alert('الملف لا يحتوي على بنية قاعدة بيانات صحيحة.');
                  }
                } catch (err) {
                  alert('حدث خطأ أثناء استيراد الملف. تأكد أنه ملف JSON صالح.');
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-slate-500">لا يوجد طلاب مسجلين حالياً</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map(student => (
            <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center animate-fadeIn">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{student.name}</h3>
                  <p className="text-xs text-slate-400">ولي الأمر: {student.parentName}</p>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleOpenModal(student)}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الطالب*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم هاتف الطالب</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-left"
                  dir="ltr"
                />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم ولي الأمر</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="اسم الأب أو الأم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-left"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition shadow-lg active:scale-95"
              >
                {editingStudent ? 'حفظ التغييرات' : 'إضافة الطالب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
