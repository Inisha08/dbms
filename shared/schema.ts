import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull().unique(),
  password: text("password").notNull(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  password: text("password").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  credits: integer("credits").notNull(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  grade: text("grade").notNull(),
  points: decimal("points", { precision: 3, scale: 2 }).notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  teacherId: integer("teacher_id").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  userType: z.enum(['student', 'teacher']),
});

export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Result = typeof results.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export interface StudentWithResults extends Student {
  results: (Result & { subject: Subject })[];
}

export interface ResultWithDetails extends Result {
  student: Student;
  subject: Subject;
  teacher: Teacher;
}
