import { Pool } from 'pg';

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'student_result_db_sql',
  password: 'tecH624$',
  port: 5432,
});