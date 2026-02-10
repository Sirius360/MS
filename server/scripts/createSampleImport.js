// Script to create sample import and update stock
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID, formatDate, formatDateTime } from '../utils/helpers.js';

async function createSampleImport() {
    console.log('📦 Creating sample import order...\n');

    try {
        // Get products and supplier
        const products = await jsonDB.findAll('products');
        const suppliers = await jsonDB.findAll('suppliers');

        if (products.length === 0 || suppliers.length === 0) {
            console.log('❌ No products or suppliers found. Please run seedData.js first.');
            process.exit(1);
        }

        // Use first supplier (Apple)
        const supplier = suppliers[0];
        console.log(`📍 Supplier: ${supplier.name}`);

        // Create import with transaction
        const result = await jsonDB.transaction(async () => {
            const importDateTime = new Date().toISOString();
            const importDate = formatDate(importDateTime);

            // Import items:
            // - iPhone 15 Pro Max: 10 units @ 25,000,000 VND
            // - MacBook Pro 14": 5 units @ 45,000,000 VND
            const items = [
                {
                    productId: products[0].id, // iPhone
                    quantity: 10,
                    unitPrice: 25000000,
                    discount: 0
                },
                {
                    productId: products[2].id, // MacBook
                    quantity: 5,
                    unitPrice: 45000000,
                    discount: 0
                }
            ];

            // Calculate total
            let totalAmount = 0;
            for (const item of items) {
                const itemTotal = (item.quantity * item.unitPrice) - item.discount;
                totalAmount += itemTotal;
            }

            // Generate import code
            const importCode = await jsonDB.getNextCode('PN', 'imports');
            const importId = generateUUID();

            console.log(`📝 Creating import ${importCode}...`);

            // Create import record
            const newImport = await jsonDB.insert('imports', {
                id: importId,
                code: importCode,
                supplierId: supplier.id,
                date: importDate,
                importDateTime: formatDateTime(importDateTime),
                totalAmount,
                discountAmount: 0,
                notes: 'Phiếu nhập mẫu - Tạo tự động'
            });

            console.log(`✅ Import ${importCode} created`);
            console.log(`   Total amount: ${totalAmount.toLocaleString('vi-VN')} VND\n`);

            // Insert import items and update stock
            console.log('📦 Adding items and updating stock...');
            for (const item of items) {
                const product = products.find(p => p.id === item.productId);
                const itemTotal = (item.quantity * item.unitPrice) - item.discount;

                // Insert import item
                const itemId = generateUUID();
                await jsonDB.insert('import_items', {
                    id: itemId,
                    importId,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount,
                    total: itemTotal
                });

                // Update product stock (ADD quantity)
                const oldStock = product.stockQty || 0;
                const newStock = oldStock + item.quantity;

                await jsonDB.update('products', item.productId, {
                    stockQty: newStock
                });

                console.log(`   ✅ ${product.name}`);
                console.log(`      Stock: ${oldStock} → ${newStock} (+${item.quantity})`);
            }

            return newImport;
        });

        console.log('\n✅ Sample import created successfully!');
        console.log(`   Import Code: ${result.code}`);
        console.log('\n📊 Updated Stock Summary:');

        // Show updated stock
        const updatedProducts = await jsonDB.findAll('products');
        for (const product of updatedProducts) {
            console.log(`   - ${product.name}: ${product.stockQty} ${product.unit}`);
        }

        console.log('\n💡 Next steps:');
        console.log('   1. Refresh frontend to see updated stock');
        console.log('   2. Try creating sales invoice with these products');
        console.log('   3. Stock will decrease after sales\n');

    } catch (error) {
        console.error('❌ Error creating import:', error);
        process.exit(1);
    }
}

// Run
createSampleImport();
