// ===== server/seed-test-data.js =====
// Seed fake data for testing UI

import pool from './database/mysqlPool.js';
import { v4 as uuidv4 } from 'uuid';

const formatDate = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

async function seedData() {
  let connection;
  
  try {
    console.log('\n🌱 Seeding test data...\n');
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const now = new Date();
    
    // 1. Seed more product groups
    console.log('📁 Seeding product groups...');
    const groups = [
      { id: uuidv4(), name: 'Điện thoại', minPrice: 2000000, maxPrice: 30000000, description: 'Smartphone và điện thoại di động', status: 'active' },
      { id: uuidv4(), name: 'Máy tính bảng', minPrice: 5000000, maxPrice: 25000000, description: 'Tablet và iPad', status: 'active' },
      { id: uuidv4(), name: 'Phụ kiện', minPrice: 50000, maxPrice: 5000000, description: 'Phụ kiện điện thoại, laptop', status: 'active' },
      { id: uuidv4(), name: 'Tai nghe', minPrice: 100000, maxPrice: 10000000, description: 'Tai nghe bluetooth, có dây', status: 'active' },
      { id: uuidv4(), name: 'Thiết bị mạng', minPrice: 200000, maxPrice: 5000000, description: 'Router, switch, modem', status: 'active' },
    ];
    
    for (const g of groups) {
      await connection.query(
        `INSERT INTO product_groups (id, name, minPrice, maxPrice, description, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [g.id, g.name, g.minPrice, g.maxPrice, g.description, g.status, formatDate(now), formatDate(now)]
      );
    }
    console.log(`   ✅ Added ${groups.length} product groups`);
    
    // 2. Seed suppliers
    console.log('\n🏢 Seeding suppliers...');
    const suppliers = [
      { id: uuidv4(), name: 'Công ty Apple Việt Nam', phone: '0900111222', email: 'contact@apple.vn', address: 'Quận 1, TP.HCM', notes: 'Nhà phân phối Apple' },
      { id: uuidv4(), name: 'Samsung Electronics VN', phone: '0900333444', email: 'info@samsung.vn', address: 'Quận 3, TP.HCM', notes: 'Nhà phân phối Samsung' },
      { id: uuidv4(), name: 'Xiaomi Store', phone: '0900555666', email: 'support@xiaomi.vn', address: 'Quận 7, TP.HCM', notes: 'Nhà phân phối Xiaomi' },
      { id: uuidv4(), name: 'Dell Vietnam', phone: '0900777888', email: 'sales@dell.vn', address: 'Quận 2, TP.HCM', notes: 'Nhà phân phối Dell' },
      { id: uuidv4(), name: 'HP Inc Vietnam', phone: '0900999000', email: 'contact@hp.vn', address: 'Quận Bình Thạnh, TP.HCM', notes: 'Nhà phân phối HP' },
    ];
    
    for (const s of suppliers) {
      await connection.query(
        `INSERT INTO suppliers (id, name, phone, email, address, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.name, s.phone, s.email, s.address, s.notes, formatDate(now), formatDate(now)]
      );
    }
    console.log(`   ✅ Added ${suppliers.length} suppliers`);
    
    // 3. Seed customers
    console.log('\n👤 Seeding customers...');
    const customers = [
      { id: uuidv4(), name: 'Nguyễn Văn An', phone: '0912345678', email: 'an.nguyen@gmail.com', address: '123 Lê Lợi, Q1, TP.HCM', notes: 'Khách VIP' },
      { id: uuidv4(), name: 'Trần Thị Bình', phone: '0923456789', email: 'binh.tran@gmail.com', address: '456 Nguyễn Huệ, Q1, TP.HCM', notes: '' },
      { id: uuidv4(), name: 'Lê Hoàng Cường', phone: '0934567890', email: 'cuong.le@gmail.com', address: '789 Trần Hưng Đạo, Q5, TP.HCM', notes: 'Mua nhiều' },
      { id: uuidv4(), name: 'Phạm Minh Đức', phone: '0945678901', email: 'duc.pham@gmail.com', address: '321 Cách Mạng Tháng 8, Q3, TP.HCM', notes: '' },
      { id: uuidv4(), name: 'Võ Thị Hoa', phone: '0956789012', email: 'hoa.vo@gmail.com', address: '654 Lý Thường Kiệt, Q10, TP.HCM', notes: 'Khách thân thiết' },
      { id: uuidv4(), name: 'Đặng Văn Khoa', phone: '0967890123', email: 'khoa.dang@gmail.com', address: '987 Điện Biên Phủ, Q3, TP.HCM', notes: '' },
      { id: uuidv4(), name: 'Huỳnh Thị Lan', phone: '0978901234', email: 'lan.huynh@gmail.com', address: '147 Võ Văn Tần, Q3, TP.HCM', notes: '' },
      { id: uuidv4(), name: 'Bùi Minh Nam', phone: '0989012345', email: 'nam.bui@gmail.com', address: '258 Hai Bà Trưng, Q1, TP.HCM', notes: 'Mua sỉ' },
    ];
    
    for (const c of customers) {
      await connection.query(
        `INSERT INTO customers (id, name, phone, email, address, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.phone, c.email, c.address, c.notes, formatDate(now), formatDate(now)]
      );
    }
    console.log(`   ✅ Added ${customers.length} customers`);
    
    // 4. Seed many products
    console.log('\n📦 Seeding products...');
    const products = [
      // Laptops - use groups[0]
      { sku: 'LP001', name: 'MacBook Pro 14" M3', type: 'product', groupId: groups[0].id, costPrice: 45000000, salePrice: 52000000, stockQty: 15, unit: 'cái', status: 'in_stock' },
      { sku: 'LP002', name: 'MacBook Air 13" M2', type: 'product', groupId: groups[0].id, costPrice: 28000000, salePrice: 32000000, stockQty: 25, unit: 'cái', status: 'in_stock' },
      { sku: 'LP003', name: 'Dell XPS 13', type: 'product', groupId: groups[0].id, costPrice: 25000000, salePrice: 29000000, stockQty: 10, unit: 'cái', status: 'in_stock' },
      { sku: 'LP004', name: 'HP Pavilion 15', type: 'product', groupId: groups[0].id, costPrice: 15000000, salePrice: 18000000, stockQty: 20, unit: 'cái', status: 'in_stock' },
      { sku: 'LP005', name: 'Lenovo ThinkPad X1', type: 'product', groupId: groups[0].id, costPrice: 30000000, salePrice: 35000000, stockQty: 8, unit: 'cái', status: 'in_stock' },
      
      // Phones - use groups[0]
      { sku: 'PH001', name: 'iPhone 15 Pro Max 256GB', type: 'product', groupId: groups[0].id, costPrice: 28000000, salePrice: 32000000, stockQty: 30, unit: 'cái', status: 'in_stock' },
      { sku: 'PH002', name: 'iPhone 15 128GB', type: 'product', groupId: groups[0].id, costPrice: 20000000, salePrice: 23000000, stockQty: 40, unit: 'cái', status: 'in_stock' },
      { sku: 'PH003', name: 'Samsung Galaxy S24 Ultra', type: 'product', groupId: groups[0].id, costPrice: 25000000, salePrice: 29000000, stockQty: 25, unit: 'cái', status: 'in_stock' },
      { sku: 'PH004', name: 'Samsung Galaxy S24', type: 'product', groupId: groups[0].id, costPrice: 18000000, salePrice: 21000000, stockQty: 35, unit: 'cái', status: 'in_stock' },
      { sku: 'PH005', name: 'Xiaomi 14 Pro', type: 'product', groupId: groups[0].id, costPrice: 15000000, salePrice: 17500000, stockQty: 20, unit: 'cái', status: 'in_stock' },
      { sku: 'PH006', name: 'Xiaomi 14', type: 'product', groupId: groups[0].id, costPrice: 12000000, salePrice: 14000000, stockQty: 30, unit: 'cái', status: 'in_stock' },
      
      // Tablets - use groups[1]
      { sku: 'TB001', name: 'iPad Pro 12.9" M2', type: 'product', groupId: groups[1].id, costPrice: 25000000, salePrice: 29000000, stockQty: 12, unit: 'cái', status: 'in_stock' },
      { sku: 'TB002', name: 'iPad Air 10.9"', type: 'product', groupId: groups[1].id, costPrice: 15000000, salePrice: 17500000, stockQty: 18, unit: 'cái', status: 'in_stock' },
      { sku: 'TB003', name: 'Samsung Galaxy Tab S9', type: 'product', groupId: groups[1].id, costPrice: 12000000, salePrice: 14000000, stockQty: 15, unit: 'cái', status: 'in_stock' },
      
      // Accessories - use groups[2]
      { sku: 'AC001', name: 'AirPods Pro 2', type: 'product', groupId: groups[2].id, costPrice: 5000000, salePrice: 6000000, stockQty: 50, unit: 'cái', status: 'in_stock' },
      { sku: 'AC002', name: 'Magic Keyboard', type: 'product', groupId: groups[2].id, costPrice: 2500000, salePrice: 3000000, stockQty: 30, unit: 'cái', status: 'in_stock' },
      { sku: 'AC003', name: 'Magic Mouse', type: 'product', groupId: groups[2].id, costPrice: 1800000, salePrice: 2200000, stockQty: 40, unit: 'cái', status: 'in_stock' },
      { sku: 'AC004', name: 'Samsung Buds Pro', type: 'product', groupId: groups[2].id, costPrice: 3500000, salePrice: 4200000, stockQty: 35, unit: 'cái', status: 'in_stock' },
      { sku: 'AC005', name: 'Apple Watch Series 9', type: 'product', groupId: groups[2].id, costPrice: 9000000, salePrice: 10500000, stockQty: 20, unit: 'cái', status: 'in_stock' },
      
      // Headphones - use groups[3]
      { sku: 'HP001', name: 'Sony WH-1000XM5', type: 'product', groupId: groups[3].id, costPrice: 7000000, salePrice: 8500000, stockQty: 15, unit: 'cái', status: 'in_stock' },
      { sku: 'HP002', name: 'Bose QuietComfort 45', type: 'product', groupId: groups[3].id, costPrice: 6500000, salePrice: 7800000, stockQty: 12, unit: 'cái', status: 'in_stock' },
      { sku: 'HP003', name: 'JBL Tune 770NC', type: 'product', groupId: groups[3].id, costPrice: 2000000, salePrice: 2500000, stockQty: 25, unit: 'cái', status: 'in_stock' },
      
      // Network devices - use groups[4]
      { sku: 'NT001', name: 'TP-Link Archer AX55', type: 'product', groupId: groups[4].id, costPrice: 1500000, salePrice: 1850000, stockQty: 30, unit: 'cái', status: 'in_stock' },
      { sku: 'NT002', name: 'ASUS RT-AX86U', type: 'product', groupId: groups[4].id, costPrice: 4500000, salePrice: 5200000, stockQty: 10, unit: 'cái', status: 'in_stock' },
      { sku: 'NT003', name: 'Netgear Nighthawk', type: 'product', groupId: groups[4].id, costPrice: 3500000, salePrice: 4100000, stockQty: 8, unit: 'cái', status: 'in_stock' },
      
      // Low stock items - use groups[0]
      { sku: 'LS001', name: 'MacBook Pro 16" M3 Max', type: 'product', groupId: groups[0].id, costPrice: 80000000, salePrice: 92000000, stockQty: 2, unit: 'cái', status: 'in_stock' },
      { sku: 'LS002', name: 'iPhone 15 Pro Max 1TB', type: 'product', groupId: groups[0].id, costPrice: 40000000, salePrice: 46000000, stockQty: 3, unit: 'cái', status: 'in_stock' },
      
      // Out of stock - use groups[2]
      { sku: 'OS001', name: 'PlayStation 5', type: 'product', groupId: groups[2].id, costPrice: 12000000, salePrice: 14000000, stockQty: 0, unit: 'cái', status: 'out_of_stock' },
      { sku: 'OS002', name: 'Xbox Series X', type: 'product', groupId: groups[2].id, costPrice: 11000000, salePrice: 13000000, stockQty: 0, unit: 'cái', status: 'out_of_stock' },
    ];
    
    for (const p of products) {
      const id = uuidv4();
      await connection.query(
        `INSERT INTO products (id, sku, name, type, groupId, costPrice, salePrice, stockQty, minStock, unit, status, description, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.sku, p.name, p.type, p.groupId, p.costPrice, p.salePrice, p.stockQty, 5, p.unit, p.status, `${p.name} - Hàng chính hãng`, formatDate(now), formatDate(now)]
      );
    }
    console.log(`   ✅ Added ${products.length} products`);
    
    await connection.commit();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEED SUMMARY:');
    const [groupsC] = await connection.query('SELECT COUNT(*) as count FROM product_groups');
    const [productsC] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [customersC] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [suppliersC] = await connection.query('SELECT COUNT(*) as count FROM suppliers');
    
    console.log(`  Product Groups: ${groupsC[0].count}`);
    console.log(`  Products: ${productsC[0].count}`);
    console.log(`  Customers: ${customersC[0].count}`);
    console.log(`  Suppliers: ${suppliersC[0].count}`);
    console.log('='.repeat(60));
    console.log('✅ SEED COMPLETE!\n');
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\n❌ Seed failed:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedData();
