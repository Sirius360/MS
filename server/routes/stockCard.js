// ===== server/routes/stockCard.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';

const router = express.Router();

/**
 * GET /api/products/:id/stock-card
 * Get stock card (transaction history) for a product
 */
router.get('/:id/stock-card', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await jsonDB.findById('products', id);

        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Get all import and invoice items
        const importItems = await jsonDB.findAll('import_items');
        const invoiceItems = await jsonDB.findAll('invoice_items');
        const imports = await jsonDB.findAll('imports');
        const invoices = await jsonDB.findAll('invoices');

        // Get import transactions for this product
        const importTxns = importItems
            .filter(item => item.productId === id)
            .map(item => {
                const importRecord = imports.find(i => i.id === item.importId);
                return {
                    dateTime: importRecord?.importDateTime || importRecord?.createdAt,
                    documentCode: importRecord?.code,
                    qtyIn: item.quantity,
                    qtyOut: 0,
                    unitPrice: item.unitPrice,
                    total: item.total,
                    type: 'IMPORT'
                };
            });

        // Get sale transactions for this product
        const saleTxns = invoiceItems
            .filter(item => item.productId === id)
            .map(item => {
                const invoice = invoices.find(inv => inv.id === item.invoiceId);
                return {
                    dateTime: invoice?.date || invoice?.createdAt,
                    documentCode: invoice?.code || invoice?.id,
                    qtyIn: 0,
                    qtyOut: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total,
                    type: 'SALE'
                };
            });

        // Combine and sort transactions by date
        const allTransactions = [...importTxns, ...saleTxns].sort((a, b) => {
            return new Date(a.dateTime) - new Date(b.dateTime);
        });

        // Calculate running balance
        let stockAfter = 0;
        const transactions = allTransactions.map(txn => {
            stockAfter += txn.qtyIn - txn.qtyOut;

            return {
                dateTime: txn.dateTime,
                type: txn.type,
                documentCode: txn.documentCode,
                qtyIn: txn.qtyIn,
                qtyOut: txn.qtyOut,
                stockAfter: stockAfter,
                unitPrice: txn.unitPrice,
                total: txn.total
            };
        });

        res.json({
            success: true,
            data: {
                product: {
                    id: product.id,
                    sku: product.sku,
                    name: product.name
                },
                transactions
            }
        });

    } catch (error) {
        console.error('Get stock card error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/products/:id/cogs?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
 * Calculate Cost of Goods Sold (COGS) for a product in a date range
 */
router.get('/:id/cogs', async (req, res) => {
    try {
        const { id } = req.params;
        const { fromDate, toDate } = req.query;

        if (!fromDate || !toDate) {
            return res.status(400).json({
                success: false,
                error: 'fromDate and toDate are required'
            });
        }

        // Check if product exists
        const product = await jsonDB.findById('products', id);

        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Get all transactions
        const importItems = await jsonDB.findAll('import_items');
        const invoiceItems = await jsonDB.findAll('invoice_items');
        const imports = await jsonDB.findAll('imports');
        const invoices = await jsonDB.findAll('invoices');

        // Calculate opening stock (before fromDate)
        let openingImportQty = 0;
        importItems
            .filter(item => item.productId === id)
            .forEach(item => {
                const importRecord = imports.find(i => i.id === item.importId);
                if (importRecord && importRecord.date < fromDate) {
                    openingImportQty += item.quantity;
                }
            });

        let openingSaleQty = 0;
        invoiceItems
            .filter(item => item.productId === id)
            .forEach(item => {
                const invoice = invoices.find(inv => inv.id === item.invoiceId);
                if (invoice && invoice.date < fromDate) {
                    openingSaleQty += item.quantity;
                }
            });

        const openingStockQty = openingImportQty - openingSaleQty;
        const openingStockValue = openingStockQty * product.costPrice;

        // Calculate purchases in period
        let purchaseQty = 0;
        let purchaseValue = 0;
        importItems
            .filter(item => item.productId === id)
            .forEach(item => {
                const importRecord = imports.find(i => i.id === item.importId);
                if (importRecord && importRecord.date >= fromDate && importRecord.date <= toDate) {
                    purchaseQty += item.quantity;
                    purchaseValue += item.total || 0;
                }
            });

        // Calculate closing stock (after toDate)
        let closingImportQty = 0;
        importItems
            .filter(item => item.productId === id)
            .forEach(item => {
                const importRecord = imports.find(i => i.id === item.importId);
                if (importRecord && importRecord.date <= toDate) {
                    closingImportQty += item.quantity;
                }
            });

        let closingSaleQty = 0;
        invoiceItems
            .filter(item => item.productId === id)
            .forEach(item => {
                const invoice = invoices.find(inv => inv.id === item.invoiceId);
                if (invoice && invoice.date <= toDate) {
                    closingSaleQty += item.quantity;
                }
            });

        const closingStockQty = closingImportQty - closingSaleQty;
        const closingStockValue = closingStockQty * product.costPrice;

        // COGS = Opening Stock Value + Purchases Value - Closing Stock Value
        const cogsValue = openingStockValue + purchaseValue - closingStockValue;

        res.json({
            success: true,
            data: {
                product: {
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    costPrice: product.costPrice
                },
                period: {
                    fromDate,
                    toDate
                },
                openingStock: {
                    qty: openingStockQty,
                    value: openingStockValue
                },
                purchases: {
                    qty: purchaseQty,
                    value: purchaseValue
                },
                closingStock: {
                    qty: closingStockQty,
                    value: closingStockValue
                },
                cogs: cogsValue
            }
        });

    } catch (error) {
        console.error('Calculate COGS error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
