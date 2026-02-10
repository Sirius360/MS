// ===== server/migrate-simple.js =====
// Simple migration without error-prone fields

import pool from './database/mysqlPool.js';
import { optimizedDB } from './database/optimizedJsonDB.js';

async function migrateSimple() {
  let connection;
  
  const formatDate = (date) => {
    if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📦 Simple Migration: JSON → MySQL');
    console.log('='.repeat(60));
    
    await optimizedDB.initialize();
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // 1. Users
    console.log('\n👥 Users...');
    const users = await optimizedDB.readData('users');
    for (const user of users || []) {
      try {
        await connection.query(
          `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [user.id, user.username, user.email, user.password, user.role || 'staff', 
           user.isActive ?? true, formatDate(user.createdAt), formatDate(user.updatedAt)]
        );
      } catch (e) { console.log(`  Skip user ${user.username}: ${e.message}`); }
    }
    console.log(`✅ ${users?.length || 0} users`);
    
    // 2. Product Groups
    console.log('\n📁 Product Groups...');
    const groups = await optimizedDB.readData('product_groups');
    for (const g of groups || []) {
      try {
        await connection.query(
          `INSERT INTO product_groups (id, name, minPrice, maxPrice, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [g.id, g.name, g.minPrice || 0, g.maxPrice || 0, g.description || '', 
           g.status || 'active', formatDate(g.createdAt), formatDate(g.updatedAt)]
        );
      } catch (e) { console.log(`  Skip group ${g.name}: ${e.message}`); }
    }
    console.log(`✅ ${groups?.length || 0} groups`);
    
    // 3. Brands
    console.log('\n🏷️  Brands...');
    const brands = await optimizedDB.readData('brands');
    for (const b of brands || []) {
      try {
        await connection.query(
          `INSERT INTO brands (id, name, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [b.id, b.name, b.description || '', b.status || 'active', 
           formatDate(b.createdAt), formatDate(b.updatedAt)]
        );
      } catch (e) { console.log(`  Skip brand ${b.name}: ${e.message}`); }
    }
    console.log(`✅ ${brands?.length || 0} brands`);
    
    // 4. Products
    console.log('\n📦 Products...');
    const products = await optimizedDB.readData('products');
    for (const p of products || []) {
      try {
        await connection.query(
          `INSERT INTO products (id, sku, name, type, groupId, brandId, unit, costPrice, 
           salePrice, stockQty, minStock, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [p.id, p.sku, p.name, p.type || 'product', p.groupId || null, p.brandId || null, 
           p.unit || 'cái', p.costPrice || 0, p.salePrice || 0, p.stockQuantity || 0,
           p.minStock || 0, p.description || '', p.status || 'in_stock',
           formatDate(p.createdAt), formatDate(p.updatedAt)]
        );
      } catch (e) { console.log(`  Skip product ${p.sku}: ${e.message}`); }
    }
    console.log(`✅ ${products?.length || 0} products`);
    
    // 5. Customers
    console.log('\n👤 Customers...');
    const customers = await optimizedDB.readData('customers');
    for (const c of customers || []) {
      try {
        await connection.query(
          `INSERT INTO customers (id, name, phone, email, address, notes, totalDebt, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [c.id, c.name, c.phone || '', c.email || '', c.address || '', c.notes || '', 
           c.totalDebt || 0, formatDate(c.createdAt), formatDate(c.updatedAt)]
        );
      } catch (e) { console.log(`  Skip customer ${c.name}: ${e.message}`); }
    }
    console.log(`✅ ${customers?.length || 0} customers`);
    
    // 6. Suppliers
    console.log('\n🏢 Suppliers...');
    const suppliers = await optimizedDB.readData('suppliers');
    for (const s of suppliers || []) {
      try {
        await connection.query(
          `INSERT INTO suppliers (id, name, phone, email, address, notes, totalDebt, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [s.id, s.name, s.phone || '', s.email || '', s.address || '', s.notes || '', 
           s.totalDebt || 0, formatDate(s.createdAt), formatDate(s.updatedAt)]
        );
      } catch (e) { console.log(`  Skip supplier ${s.name}: ${e.message}`); }
    }
    console.log(`✅ ${suppliers?.length || 0} suppliers`);
    
    await connection.commit();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    const [usersC] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [groupsC] = await connection.query('SELECT COUNT(*) as count FROM product_groups');
    const [brandsC] = await connection.query('SELECT COUNT(*) as count FROM brands');
    const [productsC] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [customersC] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [suppliersC] = await connection.query('SELECT COUNT(*) as count FROM suppliers');
    
    console.log(`  Users: ${usersC[0].count}`);
    console.log(`  Product Groups: ${groupsC[0].count}`);
    console.log(`  Brands: ${brandsC[0].count}`);
    console.log(`  Products: ${productsC[0].count}`);
    console.log(`  Customers: ${customersC[0].count}`);
    console.log(`  Suppliers: ${suppliersC[0].count}`);
    console.log('='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!\n');
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrateSimple();
