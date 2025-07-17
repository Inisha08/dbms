import { 
  students, 
  teachers, 
  subjects, 
  results,
  type Student, 
  type Teacher, 
  type Subject, 
  type Result,
  type InsertStudent, 
  type InsertTeacher, 
  type InsertSubject, 
  type InsertResult,
  type StudentWithResults,
  type ResultWithDetails
} from "@shared/schema";

export interface IStorage {
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;

  // Teacher operations
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByEmail(email: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getAllTeachers(): Promise<Teacher[]>;

  // Subject operations
  getSubject(id: number): Promise<Subject | undefined>;
  getSubjectByCode(code: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  getAllSubjects(): Promise<Subject[]>;

  // Result operations
  getResult(id: number): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, result: Partial<InsertResult>): Promise<Result | undefined>;
  deleteResult(id: number): Promise<boolean>;
  getResultsByStudent(studentId: number): Promise<ResultWithDetails[]>;
  getResultsByTeacher(teacherId: number): Promise<ResultWithDetails[]>;
  getResultsBySubject(subjectId: number): Promise<ResultWithDetails[]>;
  getResultsBySemester(semester: number): Promise<ResultWithDetails[]>;
  searchResults(filters: {
    studentId?: number;
    subjectId?: number;
    semester?: number;
    teacherId?: number;
  }): Promise<ResultWithDetails[]>;
  getStudentWithResults(studentId: number): Promise<StudentWithResults | undefined>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private teachers: Map<number, Teacher>;
  private subjects: Map<number, Subject>;
  private results: Map<number, Result>;
  private currentStudentId: number;
  private currentTeacherId: number;
  private currentSubjectId: number;
  private currentResultId: number;

  constructor() {
    this.students = new Map();
    this.teachers = new Map();
    this.subjects = new Map();
    this.results = new Map();
    this.currentStudentId = 1;
    this.currentTeacherId = 1;
    this.currentSubjectId = 1;
    this.currentResultId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed students
    const student1: Student = {
      id: this.currentStudentId++,
      name: "John Doe",
      email: "john.doe@student.edu",
      studentId: "STU001",
      password: "password123"
    };
    const student2: Student = {
      id: this.currentStudentId++,
      name: "Jane Smith",
      email: "jane.smith@student.edu",
      studentId: "STU002",
      password: "password123"
    };
    const student3: Student = {
      id: this.currentStudentId++,
      name: "Bob Johnson",
      email: "bob.johnson@student.edu",
      studentId: "STU003",
      password: "password123"
    };

    this.students.set(student1.id, student1);
    this.students.set(student2.id, student2);
    this.students.set(student3.id, student3);

    // Seed teachers
    const teacher1: Teacher = {
      id: this.currentTeacherId++,
      name: "Dr. Smith",
      email: "dr.smith@university.edu",
      department: "Mathematics",
      password: "teacher123"
    };
    const teacher2: Teacher = {
      id: this.currentTeacherId++,
      name: "Dr. Johnson",
      email: "dr.johnson@university.edu",
      department: "Physics",
      password: "teacher123"
    };

    this.teachers.set(teacher1.id, teacher1);
    this.teachers.set(teacher2.id, teacher2);

    // Seed subjects
    const subjects = [
      { name: "Mathematics", code: "MATH101", credits: 3 },
      { name: "Physics", code: "PHYS101", credits: 4 },
      { name: "Chemistry", code: "CHEM101", credits: 3 },
      { name: "Biology", code: "BIOL101", credits: 3 },
      { name: "English", code: "ENG101", credits: 2 },
      { name: "Computer Science", code: "CS101", credits: 4 }
    ];

    subjects.forEach(subject => {
      const subjectData: Subject = {
        id: this.currentSubjectId++,
        ...subject
      };
      this.subjects.set(subjectData.id, subjectData);
    });

    // Seed results
    const sampleResults = [
      { studentId: 1, subjectId: 1, grade: "A", points: "4.00", semester: 1, academicYear: "2023-2024", teacherId: 1 },
      { studentId: 1, subjectId: 2, grade: "A-", points: "3.70", semester: 1, academicYear: "2023-2024", teacherId: 2 },
      { studentId: 1, subjectId: 3, grade: "B+", points: "3.30", semester: 1, academicYear: "2023-2024", teacherId: 1 },
      { studentId: 1, subjectId: 4, grade: "B", points: "3.00", semester: 2, academicYear: "2023-2024", teacherId: 2 },
      { studentId: 2, subjectId: 1, grade: "A", points: "4.00", semester: 1, academicYear: "2023-2024", teacherId: 1 },
      { studentId: 2, subjectId: 2, grade: "B+", points: "3.30", semester: 1, academicYear: "2023-2024", teacherId: 2 },
      { studentId: 3, subjectId: 1, grade: "B", points: "3.00", semester: 1, academicYear: "2023-2024", teacherId: 1 },
    ];

    sampleResults.forEach(result => {
      const resultData: Result = {
        id: this.currentResultId++,
        ...result
      };
      this.results.set(resultData.id, resultData);
    });
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.email === email);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.studentId === studentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByEmail(email: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(teacher => teacher.email === email);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = this.currentTeacherId++;
    const teacher: Teacher = { ...insertTeacher, id };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getSubjectByCode(code: string): Promise<Subject | undefined> {
    return Array.from(this.subjects.values()).find(subject => subject.code === code);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getResult(id: number): Promise<Result | undefined> {
    return this.results.get(id);
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this.currentResultId++;
    const result: Result = { ...insertResult, id };
    this.results.set(id, result);
    return result;
  }

  async updateResult(id: number, updateData: Partial<InsertResult>): Promise<Result | undefined> {
    const existingResult = this.results.get(id);
    if (!existingResult) return undefined;

    const updatedResult: Result = { ...existingResult, ...updateData };
    this.results.set(id, updatedResult);
    return updatedResult;
  }

  async deleteResult(id: number): Promise<boolean> {
    return this.results.delete(id);
  }

  async getResultsByStudent(studentId: number): Promise<ResultWithDetails[]> {
    const results = Array.from(this.results.values()).filter(result => result.studentId === studentId);
    return this.enrichResults(results);
  }

  async getResultsByTeacher(teacherId: number): Promise<ResultWithDetails[]> {
    const results = Array.from(this.results.values()).filter(result => result.teacherId === teacherId);
    return this.enrichResults(results);
  }

  async getResultsBySubject(subjectId: number): Promise<ResultWithDetails[]> {
    const results = Array.from(this.results.values()).filter(result => result.subjectId === subjectId);
    return this.enrichResults(results);
  }

  async getResultsBySemester(semester: number): Promise<ResultWithDetails[]> {
    const results = Array.from(this.results.values()).filter(result => result.semester === semester);
    return this.enrichResults(results);
  }

  async searchResults(filters: {
    studentId?: number;
    subjectId?: number;
    semester?: number;
    teacherId?: number;
  }): Promise<ResultWithDetails[]> {
    let results = Array.from(this.results.values());

    if (filters.studentId) {
      results = results.filter(result => result.studentId === filters.studentId);
    }
    if (filters.subjectId) {
      results = results.filter(result => result.subjectId === filters.subjectId);
    }
    if (filters.semester) {
      results = results.filter(result => result.semester === filters.semester);
    }
    if (filters.teacherId) {
      results = results.filter(result => result.teacherId === filters.teacherId);
    }

    return this.enrichResults(results);
  }

  async getStudentWithResults(studentId: number): Promise<StudentWithResults | undefined> {
    const student = await this.getStudent(studentId);
    if (!student) return undefined;

    const results = Array.from(this.results.values())
      .filter(result => result.studentId === studentId)
      .map(result => {
        const subject = this.subjects.get(result.subjectId);
        return { ...result, subject: subject! };
      });

    return { ...student, results };
  }

  private async enrichResults(results: Result[]): Promise<ResultWithDetails[]> {
    return results.map(result => {
      const student = this.students.get(result.studentId);
      const subject = this.subjects.get(result.subjectId);
      const teacher = this.teachers.get(result.teacherId);

      return {
        ...result,
        student: student!,
        subject: subject!,
        teacher: teacher!
      };
    });
  }
}

export const storage = new MemStorage();
