// ===== server/test-mysql-connection.js =====
// Test MySQL connection and setup database

import pool from './database/mysqlPool.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAndSetup() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Testing MySQL Connection...');
    console.log('='.repeat(60));
    
    // Get connection from pool
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL successfully!');
    
    // Show MySQL version
    const [versions] = await connection.query('SELECT VERSION() as version');
    console.log(`📌 MySQL Version: ${versions[0].version}`);
    
    // Show current databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log(`\n📂 Existing Databases:`);
    databases.forEach(db => {
      console.log(`   - ${Object.values(db)[0]}`);
    });
    
    // Check if quanlybanhang database exists
    const dbExists = databases.some(db => Object.values(db)[0] === 'quanlybanhang');
    
    if (!dbExists) {
      console.log('\n🔨 Creating quanlybanhang database...');
      await connection.query('CREATE DATABASE quanlybanhang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ Database created successfully!');
    } else {
      console.log('\n✅ quanlybanhang database already exists');
    }
    
    // Use the database
    await connection.query('USE quanlybanhang');
    
    // Show tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📋 Tables in quanlybanhang: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('   (Empty - ready for schema import)');
      console.log('\n📝 Next step: Import schema.sql');
      console.log('   Run: node import-schema.js');
    } else {
      console.log('   Tables:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }
    
    // Test query performance
    console.log('\n⚡ Testing query performance...');
    const start = Date.now();
    await connection.query('SELECT 1');
    const duration = Date.now() - start;
    console.log(`   Query time: ${duration}ms`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MySQL Connection Test Complete!');
    console.log('='.repeat(60));
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MySQL service is running');
    console.error('2. Verify DB_USER and DB_PASSWORD in .env');
    console.error('3. Make sure MySQL is accessible on localhost:3306');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

testAndSetup();
