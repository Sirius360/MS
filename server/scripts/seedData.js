// Script to seed initial data for testing
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID } from '../utils/helpers.js';

async function seedData() {
    console.log('🌱 Starting data seeding...\n');

    try {
        // Check existing data
        const existingProducts = await jsonDB.findAll('products');
        const existingSuppliers = await jsonDB.findAll('suppliers');
        const existingGroups = await jsonDB.findAll('product_groups');

        if (existingProducts.length > 0) {
            console.log(`ℹ️  Found ${existingProducts.length} existing products. Skipping product seeding.`);
        } else {
            console.log('📦 Creating product groups...');

            // Create product groups
            const group1Id = generateUUID();
            await jsonDB.insert('product_groups', {
                id: group1Id,
                name: 'Điện thoại',
                description: 'Điện thoại di động các loại',
                status: 'active'
            });

            const group2Id = generateUUID();
            await jsonDB.insert('product_groups', {
                id: group2Id,
                name: 'Laptop',
                description: 'Máy tính xách tay',
                status: 'active'
            });

            console.log('✅ Created 2 product groups\n');

            console.log('📦 Creating sample products...');

            // Create products
            const products = [
                {
                    sku: await jsonDB.getNextCode('SP', 'products'),
                    name: 'iPhone 15 Pro Max 256GB',
                    groupId: group1Id,
                    unit: 'cái',
                    costPrice: 25000000,
                    salePriceBeforeTax: 30000000,
                    salePrice: 33000000,
                    vatSale: 10,
                    stockQty: 0,
                    minStock: 5,
                    status: 'active',
                    notes: 'Màu Titan Tự Nhiên'
                },
                {
                    sku: await jsonDB.getNextCode('SP', 'products'),
                    name: 'Samsung Galaxy S24 Ultra 512GB',
                    groupId: group1Id,
                    unit: 'cái',
                    costPrice: 22000000,
                    salePriceBeforeTax: 27000000,
                    salePrice: 29700000,
                    vatSale: 10,
                    stockQty: 0,
                    minStock: 5,
                    status: 'active',
                    notes: 'Màu Titanium Gray'
                },
                {
                    sku: await jsonDB.getNextCode('SP', 'products'),
                    name: 'MacBook Pro 14" M3 Pro',
                    groupId: group2Id,
                    unit: 'cái',
                    costPrice: 45000000,
                    salePriceBeforeTax: 52000000,
                    salePrice: 57200000,
                    vatSale: 10,
                    stockQty: 0,
                    minStock: 3,
                    status: 'active',
                    notes: '18GB RAM, 512GB SSD'
                }
            ];

            for (const product of products) {
                const productId = generateUUID();
                await jsonDB.insert('products', {
                    id: productId,
                    ...product,
                    isDeleted: false
                });
            }

            console.log(`✅ Created ${products.length} sample products\n`);
        }

        if (existingSuppliers.length > 0) {
            console.log(`ℹ️  Found ${existingSuppliers.length} existing suppliers. Skipping supplier seeding.`);
        } else {
            console.log('🏢 Creating sample suppliers...');

            const suppliers = [
                {
                    code: await jsonDB.getNextCode('NCC', 'suppliers'),
                    name: 'Công ty TNHH Apple Việt Nam',
                    phone: '0900000001',
                    email: 'apple@example.com',
                    address: 'Quận 1, TP.HCM',
                    notes: 'Nhà phân phối chính hãng Apple'
                },
                {
                    code: await jsonDB.getNextCode('NCC', 'suppliers'),
                    name: 'Công ty Samsung Electronics',
                    phone: '0900000002',
                    email: 'samsung@example.com',
                    address: 'Quận 3, TP.HCM',
                    notes: 'Nhà phân phối chính hãng Samsung'
                }
            ];

            for (const supplier of suppliers) {
                const supplierId = generateUUID();
                await jsonDB.insert('suppliers', {
                    id: supplierId,
                    ...supplier
                });
            }

            console.log(`✅ Created ${suppliers.length} sample suppliers\n`);
        }

        // Summary
        const finalProducts = await jsonDB.findAll('products');
        const finalSuppliers = await jsonDB.findAll('suppliers');
        const finalGroups = await jsonDB.findAll('product_groups');

        console.log('\n📊 Data Summary:');
        console.log(`   - Product Groups: ${finalGroups.length}`);
        console.log(`   - Products: ${finalProducts.length}`);
        console.log(`   - Suppliers: ${finalSuppliers.length}`);
        console.log('\n✅ Seeding completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart backend server: npm run dev (in server folder)');
        console.log('   2. Open frontend: http://localhost:8080');
        console.log('   3. Create import order to test stock updates\n');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run seeding
seedData();
