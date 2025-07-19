export interface Student {
  id: number;
  name: string;
  email: string;
  student_id: string;
  results: ResultEntry[];
}

export interface ResultEntry {
  id: number;
  student_id: number;
  subject_id: number;
  grade: string;
  points: number;
  semester: number;
  academic_year: string;
  teacher_id: number;

  subject: {
    id: number;
    name: string;
    code: string;
    credits: number;
  };
}

export interface GPACalculation {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
}

export function calculateGPA(results: ResultEntry[]): GPACalculation {
  if (results.length === 0) {
    return { gpa: 0, totalCredits: 0, totalGradePoints: 0 };
  }
const totalGradePoints = results.reduce((sum, result) => {
  return sum + result.points * result.subject?.credits!;
}, 0);

const totalCredits = results.reduce((sum, result) => {
  return sum + (result.subject?.credits || 0);
}, 0);


  const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalCredits,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
  };
}

export function calculateSemesterGPA(results: ResultEntry[], semester: number): GPACalculation {
  const semesterResults = results.filter(result => result.semester === semester);
  return calculateGPA(semesterResults);
}

export function calculateCGPA(results: ResultEntry[]): GPACalculation {
  return calculateGPA(results);
}

export function getSemesterWiseGPA(results: ResultEntry[]): Array<{ semester: number; gpa: number; credits: number }> {
  const semesters = Array.from(new Set(results.map(r => r.semester))).sort();

  return semesters.map(semester => {
    const calculation = calculateSemesterGPA(results, semester);
    return {
      semester,
      gpa: calculation.gpa,
      credits: calculation.totalCredits,
    };
  });
}