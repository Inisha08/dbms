import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertResultSchema,
  type LoginRequest,
  type InsertResult
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, userType } = loginSchema.parse(req.body);
      
      if (userType === "student") {
        const student = await storage.getStudentByEmail(email);
        if (!student || student.password !== password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        res.json({ user: { ...student, password: undefined }, userType: "student" });
      } else if (userType === "teacher") {
        const teacher = await storage.getTeacherByEmail(email);
        if (!teacher || teacher.password !== password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        res.json({ user: { ...teacher, password: undefined }, userType: "teacher" });
      } else {
        res.status(400).json({ message: "Invalid user type" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Student routes
  app.get("/api/students", async (req, res) => {
    const students = await storage.getAllStudents();
    res.json(students.map(student => ({ ...student, password: undefined })));
  });

  app.get("/api/students/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ ...student, password: undefined });
  });

  app.get("/api/students/:id/results", async (req, res) => {
    const id = parseInt(req.params.id);
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    const results = await storage.getResultsByStudent(id);
    res.json(results);
  });

  app.get("/api/students/:id/with-results", async (req, res) => {
    const id = parseInt(req.params.id);
    const studentWithResults = await storage.getStudentWithResults(id);
    if (!studentWithResults) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ ...studentWithResults, password: undefined });
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    const subjects = await storage.getAllSubjects();
    res.json(subjects);
  });

  app.get("/api/subjects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const subject = await storage.getSubject(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(subject);
  });

  // Result routes
  app.get("/api/results", async (req, res) => {
    const { studentId, subjectId, semester, teacherId } = req.query;
    
    const filters: any = {};
    if (studentId) filters.studentId = parseInt(studentId as string);
    if (subjectId) filters.subjectId = parseInt(subjectId as string);
    if (semester) filters.semester = parseInt(semester as string);
    if (teacherId) filters.teacherId = parseInt(teacherId as string);

    const results = await storage.searchResults(filters);
    res.json(results);
  });

  app.post("/api/results", async (req, res) => {
    try {
      const resultData = insertResultSchema.parse(req.body);
      const result = await storage.createResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid result data" });
    }
  });

  app.put("/api/results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const result = await storage.updateResult(id, updateData);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/results/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteResult(id);
    if (!deleted) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.json({ message: "Result deleted successfully" });
  });

  app.get("/api/results/teacher/:teacherId", async (req, res) => {
    const teacherId = parseInt(req.params.teacherId);
    const results = await storage.getResultsByTeacher(teacherId);
    res.json(results);
  });

  const httpServer = createServer(app);
  return httpServer;
}
