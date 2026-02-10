// ===== server/routes/invoices.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID, formatDate, calculateDiscount } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/invoices
 * Get list of invoices with filters
 */
router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate, customerId, code } = req.query;

    let invoices = await jsonDB.findAll('invoices');
    const customers = await jsonDB.findAll('customers');
    const invoiceItems = await jsonDB.findAll('invoice_items');

    // Apply filters
    if (fromDate) {
      invoices = invoices.filter(inv => inv.date >= fromDate);
    }

    if (toDate) {
      invoices = invoices.filter(inv => inv.date <= toDate);
    }

    if (customerId) {
      invoices = invoices.filter(inv => inv.customerId === customerId);
    }

    if (code) {
      const codeLower = code.toLowerCase();
      invoices = invoices.filter(inv => inv.code && inv.code.toLowerCase().includes(codeLower));
    }

    // Add customer info and item count
    const invoicesWithDetails = invoices.map(inv => {
      const customer = customers.find(c => c.id === inv.customerId);
      const itemCount = invoiceItems.filter(item => item.invoiceId === inv.id).length;

      return {
        ...inv,
        customerName: customer?.name || null,
        customerPhone: customer?.phone || null,
        itemCount
      };
    });

    // Sort by createdAt DESC
    invoicesWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate totals
    const totalRecords = invoicesWithDetails.length;
    const totalRevenue = invoicesWithDetails.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        invoices: invoicesWithDetails,
        totalRecords,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/invoices/:id
 * Get invoice details with items
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await jsonDB.findById('invoices', id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Get customer info
    const customer = invoice.customerId ? await jsonDB.findById('customers', invoice.customerId) : null;

    // Get invoice items
    const allItems = await jsonDB.findAll('invoice_items');
    const items = allItems.filter(item => item.invoiceId === id);

    // Get product info for items
    const products = await jsonDB.findAll('products');
    const itemsWithProducts = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        sku: product?.sku || null,
        productName: product?.name || null,
        unit: product?.unit || null
      };
    });

    res.json({
      success: true,
      data: {
        ...invoice,
        customerName: customer?.name || null,
        customerPhone: customer?.phone || null,
        customerAddress: customer?.address || null,
        items: itemsWithProducts
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/invoices
 * Create new invoice (sales order)
 * TRANSACTION: Validate stock, insert invoice + items, update product stock
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const result = await jsonDB.transaction(async () => {
      const {
        customerId,
        date,
        items,
        discountType = 'amount',
        discountValue = 0,
        paymentMethod = 'cash',
        amountPaid = 0,
        notes
      } = req.body;

      if (!date || !items || items.length === 0) {
        throw new Error('Date and items are required');
      }

      // Step 1: Validate stock availability for all items
      for (const item of items) {
        const { productId, quantity } = item;

        const product = await jsonDB.findById('products', productId);

        if (!product || product.isDeleted) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.stockQty < quantity) {
          throw new Error(`Insufficient stock for product "${product.name}" (${product.sku}). Available: ${product.stockQty}, Requested: ${quantity}`);
        }
      }

      // Step 2: Calculate amounts
      let subtotal = 0;
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
      }

      const discountAmount = calculateDiscount(subtotal, discountType, discountValue);
      const totalAmount = subtotal - discountAmount;
      const change = amountPaid - totalAmount;

      // Step 3: Create invoice
      const invoiceId = generateUUID();
      const invoiceCode = `INV${Date.now().toString().slice(-6)}`; // Simple code generation

      const newInvoice = await jsonDB.insert('invoices', {
        id: invoiceId,
        code: invoiceCode,
        customerId,
        date: formatDate(date),
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        totalAmount,
        paymentMethod,
        amountPaid,
        change,
        notes,
        createdBy: req.user.id
      });

      // Step 4: Insert invoice items and update stock
      for (const item of items) {
        const { productId, quantity, unitPrice } = item;
        const itemTotal = quantity * unitPrice;

        // Insert invoice item
        const itemId = generateUUID();
        await jsonDB.insert('invoice_items', {
          id: itemId,
          invoiceId,
          productId,
          quantity,
          unitPrice,
          total: itemTotal
        });

        // Update product stock (SUBTRACT quantity)
        const product = await jsonDB.findById('products', productId);
        if (product) {
          await jsonDB.update('products', productId, {
            stockQty: product.stockQty - quantity
          });
        }
      }

      // Get customer info
      const customer = customerId ? await jsonDB.findById('customers', customerId) : null;

      return {
        ...newInvoice,
        customerName: customer?.name || null
      };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Invoice created successfully and stock updated'
    });

  } catch (error) {
    console.error('Create invoice error:', error);

    if (error.message.includes('required') || error.message.includes('stock') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
