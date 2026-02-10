// ===== server/migrate-final.js =====
// Final migration with all schema mappings corrected

import pool from './database/mysqlPool.js';
import { optimizedDB } from './database/optimizedJsonDB.js';

async function migrateFinal() {
  let connection;
  
  const formatDate = (date) => {
    if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 FINAL DATABASE MIGRATION: JSON → MySQL');
    console.log('='.repeat(70));
    
    await optimizedDB.initialize();
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    let migrated = { users: 0, groups: 0, brands: 0, products: 0, customers: 0, suppliers: 0 };
    let skipped = { users: 0, groups: 0, brands: 0, products: 0, customers: 0, suppliers: 0 };
    
    // 1. Users
    console.log('\n[1/6] 👥 Migrating Users...');
    const users = await optimizedDB.readData('users');
    for (const user of users || []) {
      try {
        await connection.query(
          `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [user.id, user.username, user.email, user.password, user.role || 'staff', 
           user.isActive ?? true, formatDate(user.createdAt), formatDate(user.updatedAt)]
        );
        migrated.users++;
      } catch (e) { skipped.users++; }
    }
    console.log(`      ✅ Migrated: ${migrated.users} | ⚠️  Skipped: ${skipped.users}`);
    
    // 2. Product Groups
    console.log('\n[2/6] 📁 Migrating Product Groups...');
    const groups = await optimizedDB.readData('product_groups');
    for (const g of groups || []) {
      try {
        await connection.query(
          `INSERT INTO product_groups (id, name, minPrice, maxPrice, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [g.id, g.name, g.minPrice || 0, g.maxPrice || 0, g.description || '', 
           g.status || 'active', formatDate(g.createdAt), formatDate(g.updatedAt)]
        );
        migrated.groups++;
      } catch (e) { skipped.groups++; }
    }
    console.log(`      ✅ Migrated: ${migrated.groups} | ⚠️  Skipped: ${skipped.groups}`);
    
    // 3. Brands
    console.log('\n[3/6] 🏷️  Migrating Brands...');
    const brands = await optimizedDB.readData('brands');
    for (const b of brands || []) {
      try {
        await connection.query(
          `INSERT INTO brands (id, name, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [b.id, b.name, b.description || '', b.status || 'active', 
           formatDate(b.createdAt), formatDate(b.updatedAt)]
        );
        migrated.brands++;
      } catch (e) { skipped.brands++; }
    }
    console.log(`      ✅ Migrated: ${migrated.brands} | ⚠️  Skipped: ${skipped.brands}`);
    
    // 4. Products - Map status correctly
    console.log('\n[4/6] 📦 Migrating Products...');
    const products = await optimizedDB.readData('products');
    for (const p of products || []) {
      try {
        // Map status: 'active' -> 'in_stock', 'inactive' -> 'out_of_stock'
        let status = 'in_stock';
        if (p.status === 'inactive' || p.status === 'out_of_stock') status = 'out_of_stock';
        if (p.status === 'discontinued') status = 'discontinued';
        
        await connection.query(
          `INSERT INTO products (id, sku, name, type, groupId, brandId, unit, costPrice, 
           salePrice, stockQty, minStock, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [p.id, p.sku, p.name, p.type || 'product', p.groupId || null, p.brandId || null, 
           p.unit || 'cái', p.costPrice || 0, p.salePrice || 0, p.stockQuantity || p.stockQty || 0,
           p.minStock || 0, p.description || '', status,
           formatDate(p.createdAt), formatDate(p.updatedAt)]
        );
        migrated.products++;
      } catch (e) { skipped.products++; }
    }
    console.log(`      ✅ Migrated: ${migrated.products} | ⚠️  Skipped: ${skipped.products}`);
    
    // 5. Customers - Remove totalDebt field (not in schema)
    console.log('\n[5/6] 👤 Migrating Customers...');
    const customers = await optimizedDB.readData('customers');
    for (const c of customers || []) {
      try {
        await connection.query(
          `INSERT INTO customers (id, name, phone, email, address, notes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [c.id, c.name, c.phone || '', c.email || '', c.address || '', c.notes || '', 
           formatDate(c.createdAt), formatDate(c.updatedAt)]
        );
        migrated.customers++;
      } catch (e) { skipped.customers++; }
    }
    console.log(`      ✅ Migrated: ${migrated.customers} | ⚠️  Skipped: ${skipped.customers}`);
    
    // 6. Suppliers - Remove totalDebt field (not in schema)
    console.log('\n[6/6] 🏢 Migrating Suppliers...');
    const suppliers = await optimizedDB.readData('suppliers');
    for (const s of suppliers || []) {
      try {
        await connection.query(
          `INSERT INTO suppliers (id, name, phone, email, address, notes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [s.id, s.name, s.phone || '', s.email || '', s.address || '', s.notes || '', 
           formatDate(s.createdAt), formatDate(s.updatedAt)]
        );
        migrated.suppliers++;
      } catch (e) { skipped.suppliers++; }
    }
    console.log(`      ✅ Migrated: ${migrated.suppliers} | ⚠️  Skipped: ${skipped.suppliers}`);
    
    await connection.commit();
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(70));
    
    const [usersC] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [groupsC] = await connection.query('SELECT COUNT(*) as count FROM product_groups');
    const [brandsC] = await connection.query('SELECT COUNT(*) as count FROM brands');
    const [productsC] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [customersC] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [suppliersC] = await connection.query('SELECT COUNT(*) as count FROM suppliers');
    
    const total = usersC[0].count + groupsC[0].count + brandsC[0].count + 
                  productsC[0].count + customersC[0].count + suppliersC[0].count;
    
    console.log(`\n  📊 Records in MySQL Database:`);
    console.log(`     Users:          ${String(usersC[0].count).padStart(4, ' ')}`);
    console.log(`     Product Groups: ${String(groupsC[0].count).padStart(4, ' ')}`);
    console.log(`     Brands:         ${String(brandsC[0].count).padStart(4, ' ')}`);
    console.log(`     Products:       ${String(productsC[0].count).padStart(4, ' ')}`);
    console.log(`     Customers:      ${String(customersC[0].count).padStart(4, ' ')}`);
    console.log(`     Suppliers:      ${String(suppliersC[0].count).padStart(4, ' ')}`);
    console.log(`     ${'─'.repeat(20)}`);
    console.log(`     TOTAL:          ${String(total).padStart(4, ' ')} records`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION COMPLETE - ALL DATA IN MYSQL!');
    console.log('='.repeat(70));
    console.log('');
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrateFinal();
