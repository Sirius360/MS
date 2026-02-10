// ===== server/migrate-json-to-mysql.js =====
// Migrate data from JSON files to MySQL database

import pool from './database/mysqlPool.js';
import { optimizedDB } from './database/optimizedJsonDB.js';
import bcrypt from 'bcryptjs';

async function migrateData() {
  let connection;
  
  // Helper function to format date for MySQL
  const formatDate = (date) => {
    if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📦 Migrating Data from JSON to MySQL...');
    console.log('='.repeat(60));
    
    // Initialize optimizedDB first
    console.log('📂 Initializing JSON database...');
    await optimizedDB.initialize();
    console.log('✅ JSON database initialized\n');
    
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL\n');
    
    // Start transaction
    await connection.beginTransaction();
    
    // 1. Migrate Users
    console.log('👥 Migrating Users...');
    const users = await optimizedDB.readData('users');
    if (users && users.length > 0) {
      for (const user of users) {
        await connection.query(
          `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [user.id, user.username, user.email, user.password, user.role, 
           user.isActive ?? true, formatDate(user.createdAt), formatDate(user.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${users.length} users`);
    } else {
      console.log('   ⚠️  No users to migrate');
    }
    
    // 2. Migrate Product Groups
    console.log('📁 Migrating Product Groups...');
    const groups = await optimizedDB.readData('product_groups');
    if (groups && groups.length > 0) {
      for (const group of groups) {
        await connection.query(
          `INSERT INTO product_groups (id, name, minPrice, maxPrice, description, configTemplate, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [group.id, group.name, group.minPrice || 0, group.maxPrice || 0, 
           group.description || '', JSON.stringify(group.configTemplate || {}), 
           group.status || 'active', formatDate(group.createdAt), formatDate(group.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${groups.length} product groups`);
    } else {
      console.log('   ⚠️  No product groups to migrate');
    }
    
    // 3. Migrate Brands
    console.log('🏷️  Migrating Brands...');
    const brands = await optimizedDB.readData('brands');
    if (brands && brands.length > 0) {
      for (const brand of brands) {
        await connection.query(
          `INSERT INTO brands (id, name, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [brand.id, brand.name, brand.description || '', brand.status || 'active', 
           formatDate(brand.createdAt), formatDate(brand.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${brands.length} brands`);
    } else {
      console.log('   ⚠️  No brands to migrate');
    }
    
    // 4. Migrate Products
    console.log('📦 Migrating Products...');
    const products = await optimizedDB.readData('products');
    if (products && products.length > 0) {
      for (const product of products) {
        await connection.query(
          `INSERT INTO products (id, sku, name, type, groupId, brandId, unit, costPrice, 
           salePrice, stockQuantity, minStock, description, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [product.id, product.sku, product.name, product.type || 'product', 
           product.groupId || null, product.brandId || null, product.unit || 'cái',
           product.costPrice || 0, product.salePrice || 0, product.stockQuantity || 0,
           product.minStock || 0, product.description || '', product.status || 'active',
           formatDate(product.createdAt), formatDate(product.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${products.length} products`);
    } else {
      console.log('   ⚠️  No products to migrate');
    }
    
    // 5. Migrate Customers
    console.log('👤 Migrating Customers...');
    const customers = await optimizedDB.readData('customers');
    if (customers && customers.length > 0) {
      for (const customer of customers) {
        await connection.query(
          `INSERT INTO customers (id, name, phone, email, address, notes, totalDebt, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [customer.id, customer.name, customer.phone || '', customer.email || '',
           customer.address || '', customer.notes || '', customer.totalDebt || 0,
           formatDate(customer.createdAt), formatDate(customer.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${customers.length} customers`);
    } else {
      console.log('   ⚠️  No customers to migrate');
    }
    
    // 6. Migrate Suppliers
    console.log('🏢 Migrating Suppliers...');
    const suppliers = await optimizedDB.readData('suppliers');
    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        await connection.query(
          `INSERT INTO suppliers (id, name, phone, email, address, notes, totalDebt, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE updatedAt = VALUES(updatedAt)`,
          [supplier.id, supplier.name, supplier.phone || '', supplier.email || '',
           supplier.address || '', supplier.notes || '', supplier.totalDebt || 0,
           formatDate(supplier.createdAt), formatDate(supplier.updatedAt)]
        );
      }
      console.log(`   ✅ Migrated ${suppliers.length} suppliers`);
    } else {
      console.log('   ⚠️  No suppliers to migrate');
    }
    
    // Commit transaction
    await connection.commit();
    console.log('\n✅ All data migrated successfully!');
    
    // Show summary
    console.log('\n📊 Migration Summary:');
    const [usersCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [groupsCount] = await connection.query('SELECT COUNT(*) as count FROM product_groups');
    const [brandsCount] = await connection.query('SELECT COUNT(*) as count FROM brands');
    const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [customersCount] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [suppliersCount] = await connection.query('SELECT COUNT(*) as count FROM suppliers');
    
    console.log(`   Users: ${usersCount[0].count}`);
    console.log(`   Product Groups: ${groupsCount[0].count}`);
    console.log(`   Brands: ${brandsCount[0].count}`);
    console.log(`   Products: ${productsCount[0].count}`);
    console.log(`   Customers: ${customersCount[0].count}`);
    console.log(`   Suppliers: ${suppliersCount[0].count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration Complete!');
    console.log('='.repeat(60));
    console.log('');
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrateData();
