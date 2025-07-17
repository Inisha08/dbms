import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { pool } from './db';

export async function registerRoutes(app: Express): Promise<Server> {
  // Login Route
  app.post("/api/auth/login", async (req, res) => {
    const { email, password, userType } = req.body;
    try {
      let query = '';
      if (userType === 'student') {
        query = 'SELECT id, name, email, student_id AS "studentId", password FROM students WHERE email = $1';
      } else if (userType === 'teacher') {
        query = 'SELECT id, name, email, department, password FROM teachers WHERE email = $1';
      } else {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const result = await pool.query(query, [email]);
      const user = result.rows[0];
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      delete user.password;
      res.json({ user, userType });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Get all students
  app.get("/api/students", async (req, res) => {
    const result = await pool.query('SELECT id, name, email, student_id AS "studentId" FROM students');
    res.json(result.rows);
  });

  // Get student by ID
  app.get("/api/students/:id", async (req, res) => {
    const result = await pool.query('SELECT id, name, email, student_id AS "studentId" FROM students WHERE id = $1', [req.params.id]);
    const student = result.rows[0];
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  // Get student with results and subject info
  app.get("/api/students/:id/with-results", async (req, res) => {
    const studentResult = await pool.query('SELECT id, name, email, student_id AS "studentId" FROM students WHERE id = $1', [req.params.id]);
    const student = studentResult.rows[0];
    if (!student) return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(`
      SELECT
        r.id,
        r.student_id AS "studentId",
        r.subject_id AS "subjectId",
        r.grade,
        r.points,
        r.semester,
        r.academic_year AS "academicYear",
        r.teacher_id AS "teacherId",
        json_build_object(
          'id', s.id,
          'name', s.name,
          'code', s.code,
          'credits', s.credits
        ) AS subject
      FROM results r
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.student_id = $1
    `, [req.params.id]);

    res.json({ ...student, results: result.rows });
  });

  // Get all subjects
  app.get("/api/subjects", async (_, res) => {
    const result = await pool.query('SELECT * FROM subjects');
    res.json(result.rows);
  });

  // Get subject by ID
  app.get("/api/subjects/:id", async (req, res) => {
    const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [req.params.id]);
    const subject = result.rows[0];
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  });

  // Search results with filters and subject info
  app.get("/api/results", async (req, res) => {
    const { studentId, subjectId, semester, teacherId } = req.query;

    const filters: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (studentId) filters.push(`r.student_id = $${i++}`), values.push(Number(studentId));
    if (subjectId) filters.push(`r.subject_id = $${i++}`), values.push(Number(subjectId));
    if (semester) filters.push(`r.semester = $${i++}`), values.push(Number(semester));
    if (teacherId) filters.push(`r.teacher_id = $${i++}`), values.push(Number(teacherId));

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT
        r.id,
        r.student_id AS "studentId",
        r.subject_id AS "subjectId",
        r.grade,
        r.points,
        r.semester,
        r.academic_year AS "academicYear",
        r.teacher_id AS "teacherId",
        json_build_object(
          'id', s.id,
          'name', s.name,
          'code', s.code,
          'credits', s.credits
        ) AS subject
      FROM results r
      JOIN subjects s ON r.subject_id = s.id
      ${where}
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  });

  // Create result
  app.post("/api/results", async (req, res) => {
    const { studentId, subjectId, grade, points, semester, academicYear, teacherId } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO results (student_id, subject_id, grade, points, semester, academic_year, teacher_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [studentId, subjectId, grade, points, semester, academicYear, teacherId]);

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Update result
  app.put("/api/results/:id", async (req, res) => {
    const id = req.params.id;
    const { studentId, subjectId, grade, points, semester, academicYear, teacherId } = req.body;

    try {
      const result = await pool.query(`
        UPDATE results
        SET student_id = $1, subject_id = $2, grade = $3, points = $4, semester = $5, academic_year = $6, teacher_id = $7
        WHERE id = $8
        RETURNING *
      `, [studentId, subjectId, grade, points, semester, academicYear, teacherId, id]);

      if (result.rowCount === 0) return res.status(404).json({ message: "Result not found" });
      res.json(result.rows[0]);
    } catch {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  // Delete result
  app.delete("/api/results/:id", async (req, res) => {
    const result = await pool.query('DELETE FROM results WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Result not found" });
    res.json({ message: "Result deleted successfully" });
  });

  // Get results by teacher
  app.get("/api/results/teacher/:teacherId", async (req, res) => {
    const query = `
      SELECT
        r.id,
        r.student_id AS "studentId",
        r.subject_id AS "subjectId",
        r.grade,
        r.points,
        r.semester,
        r.academic_year AS "academicYear",
        r.teacher_id AS "teacherId",
        json_build_object(
          'id', s.id,
          'name', s.name,
          'code', s.code,
          'credits', s.credits
        ) AS subject
      FROM results r
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.teacher_id = $1
    `;
    const result = await pool.query(query, [req.params.teacherId]);
    res.json(result.rows);
  });

  const httpServer = createServer(app);
  return httpServer;
}