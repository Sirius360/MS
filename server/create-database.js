// ===== server/create-database.js =====
// Create database without requiring it to exist first

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔨 Creating MySQL Database...');
    console.log('='.repeat(60));
    
    // Connect WITHOUT specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Show MySQL version
    const [versions] = await connection.query('SELECT VERSION() as version');
    console.log(`📌 MySQL Version: ${versions[0].version}`);
    
    // Create database
    const dbName = process.env.DB_NAME || 'quanlybanhang';
    console.log(`\n🔨 Creating database: ${dbName}...`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created successfully!`);
    
    // Verify
    await connection.query(`USE ${dbName}`);
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Current tables: ${tables.length}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database Creation Complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Import schema: node import-schema.js');
    console.log('2. Test connection: node test-mysql-connection.js');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

createDatabase();
