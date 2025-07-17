import type { Result, Subject } from "@shared/schema";

export interface GPACalculation {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
}

export function calculateGPA(results: (Result & { subject: Subject })[]): GPACalculation {
  if (results.length === 0) {
    return { gpa: 0, totalCredits: 0, totalGradePoints: 0 };
  }

  const totalGradePoints = results.reduce((sum, result) => {
    return sum + (parseFloat(result.points) * result.subject.credits);
  }, 0);

  const totalCredits = results.reduce((sum, result) => {
    return sum + result.subject.credits;
  }, 0);

  const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalCredits,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
  };
}

export function calculateSemesterGPA(results: (Result & { subject: Subject })[], semester: number): GPACalculation {
  const semesterResults = results.filter(result => result.semester === semester);
  return calculateGPA(semesterResults);
}

export function calculateCGPA(results: (Result & { subject: Subject })[]): GPACalculation {
  return calculateGPA(results);
}

export function getSemesterWiseGPA(results: (Result & { subject: Subject })[]): Array<{ semester: number; gpa: number; credits: number }> {
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
