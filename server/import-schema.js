// ===== server/import-schema.js =====
// Import schema.sql into MySQL database

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSchema() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📥 Importing Schema...');
    console.log('='.repeat(60));
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'quanlybanhang',
      multipleStatements: true, // Allow multiple SQL statements
    });
    
    console.log('✅ Connected to MySQL');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    console.log(`📖 Reading schema from: ${schemaPath}`);
    
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    
    // Split by statements and execute (skip CREATE DATABASE and USE statements)
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !s.toUpperCase().startsWith('CREATE DATABASE'))
      .filter(s => !s.toUpperCase().startsWith('USE '));
    
    console.log(`\n🔨 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        try {
          await connection.query(stmt);
          // Extract table name if CREATE TABLE
          if (stmt.toUpperCase().includes('CREATE TABLE')) {
            const match = stmt.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
            if (match) {
              console.log(`  ✅ Created table: ${match[1]}`);
            }
          }
        } catch (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            console.error(`  ❌ Error in statement ${i + 1}:`, err.message);
          }
        }
      }
    }
    
    // Show created tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📋 Total tables created: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Show table details
    console.log('\n📊 Table Details:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   ${tableName}: ${rows[0].count} rows`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Schema Import Complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Test connection: node test-mysql-connection.js');
    console.log('2. Migrate data: node migrate-json-to-mysql.js');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

importSchema();
