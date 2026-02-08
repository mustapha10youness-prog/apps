
import { Database, Student, Evaluation } from '../types';

const DB_KEY = 'MADRASSA_MANAGEMENT_DB';

const defaultDB: Database = {
  students: [],
  evaluations: []
};

export const getDB = (): Database => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return defaultDB;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultDB;
  }
};

export const saveDB = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const addStudent = (student: Student) => {
  const db = getDB();
  db.students.push(student);
  saveDB(db);
};

export const updateStudent = (id: string, updated: Partial<Student>) => {
  const db = getDB();
  db.students = db.students.map(s => s.id === id ? { ...s, ...updated } : s);
  saveDB(db);
};

export const deleteStudent = (id: string) => {
  const db = getDB();
  db.students = db.students.filter(s => s.id !== id);
  db.evaluations = db.evaluations.filter(e => e.studentId !== id);
  saveDB(db);
};

export const upsertEvaluation = (evaluation: Evaluation) => {
  const db = getDB();
  const existingIdx = db.evaluations.findIndex(
    e => e.studentId === evaluation.studentId && e.date === evaluation.date
  );

  if (existingIdx >= 0) {
    db.evaluations[existingIdx] = evaluation;
  } else {
    db.evaluations.push(evaluation);
  }
  saveDB(db);
};

export const getEvaluationsByDate = (date: string): Evaluation[] => {
  const db = getDB();
  return db.evaluations.filter(e => e.date === date);
};

export const getLastEvaluation = (studentId: string): Evaluation | undefined => {
  const db = getDB();
  const studentEvals = db.evaluations
    .filter(e => e.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return studentEvals[0];
};
