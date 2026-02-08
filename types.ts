
export enum RevisionStatus {
  EXCELLENT = 'ممتاز',
  FAIR = 'جيد',
  POOR = 'ضعيف'
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  createdAt: number;
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  hifzScore: number; // 0-10
  revisionStatus: RevisionStatus;
  behaviorRating: number; // 1-5
}

export interface Database {
  students: Student[];
  evaluations: Evaluation[];
}

export type ViewType = 'DASHBOARD' | 'STUDENTS' | 'EVALUATION' | 'REPORTS';
