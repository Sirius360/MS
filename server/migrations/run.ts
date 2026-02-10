import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔧 Running database migration...\n');

  // Create connection WITHOUT database first
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.MYSQL_DATABASE || 'quanlybanhang';
    console.log(`📦 Creating database: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created/verified\n');

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📄 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.startsWith('--') || stmt.length === 0) continue;
      
      try {
        await connection.query(stmt);
        // Extract table name from CREATE TABLE statement
        const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (match) {
          console.log(`  ✅ Created table: ${match[1]}`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error executing statement: ${error.message}`);
        console.error(`     SQL: ${stmt.substring(0, 100)}...`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Database structure:');
    
    // Show all tables
    const [tables] = await connection.query('SHOW TABLES');
    (tables as any[]).forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
