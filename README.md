# Student Results API

A small PostgreSQL + Express (TypeScript) REST API for students, teachers, subjects and results.

## Quick start
1. Copy `.env`:
```nev
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/schooldb
JWT_SECRET=change_me
SALT_ROUNDS=10
```

2. Install & run:
```bash
npm install
npm run dev
```
Minimal DB schema

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id VARCHAR(64) UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  grade VARCHAR(6),
  points NUMERIC(5,2),
  semester SMALLINT,
  academic_year VARCHAR(16),
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, subject_id, semester, academic_year)
);
```
## Security & improvements (short)
Hash passwords (bcrypt) — do not store plaintext.

Use JWT to protect write routes.

Validate input (express-validator / Joi).

Add pagination (limit, offset) and error handling.

Add migrations and seeds (node-pg-migrate / knex).

Tests: Jest + Supertest.

## Useful notes
- Keep queries parameterized (you already use $1, $2 — good).

- Remove password from API responses.

- Add role checks so students can only access their own data.