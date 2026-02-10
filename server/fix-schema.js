// Fix schema via Node.js
import pool from './database/mysqlPool.js';

async function fixSchema() {
  let connection;
  
  try {
    console.log('\n🔧 Fixing Schema...\n');
    
    connection = await pool.getConnection();
    
    // Check and fix suppliers email column
    console.log('1. Checking suppliers table...');
    try {
      await connection.query(`ALTER TABLE suppliers ADD COLUMN email VARCHAR(100) DEFAULT ''`);
      console.log('   ✅ Added email column to suppliers');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('   ✓ Email column already exists');
      } else {
        console.log('   ⚠️ ', e.message);
      }
    }
    
    // Check and fix customers email column
    console.log('\n2. Checking customers table...');
    try {
      await connection.query(`ALTER TABLE customers ADD COLUMN email VARCHAR(100) DEFAULT ''`);
      console.log('   ✅ Added email column to customers');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('   ✓ Email column already exists');
      } else {
        console.log('   ⚠️ ', e.message);
      }
    }
    
    // Check products columns
    console.log('\n3. Checking products table...');
    const [columns] = await connection.query(`SHOW COLUMNS FROM products`);
    const columnNames = columns.map(c => c.Field);
    console.log('   Columns:', columnNames.join(', '));
    
    // Check if stockQuantity exists
    if (!columnNames.includes('stockQuantity')) {
      console.log('   ⚠️ stockQuantity column missing - checking alternatives...');
      if (columnNames.includes('stock_quantity')) {
        console.log('   Found stock_quantity - migration will use this');
      } else if (columnNames.includes('stock')) {
        console.log('   Found stock - migration will use this');
      }
    } else {
      console.log('   ✓ stockQuantity column exists');
    }
    
    console.log('\n✅ Schema check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

fixSchema();
