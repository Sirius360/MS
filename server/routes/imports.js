// ===== server/routes/imports.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { generateUUID, formatDate, formatDateTime } from '../utils/helpers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/imports
 * Get list of imports with filters
 */
router.get('/', async (req, res) => {
  try {
    const { fromDate, toDate, supplierId, code } = req.query;

    let imports = await jsonDB.findAll('imports');
    const suppliers = await jsonDB.findAll('suppliers');
    const importItems = await jsonDB.findAll('import_items');

    // Apply filters
    if (fromDate) {
      imports = imports.filter(i => i.date >= fromDate);
    }

    if (toDate) {
      imports = imports.filter(i => i.date <= toDate);
    }

    if (supplierId) {
      imports = imports.filter(i => i.supplierId === supplierId);
    }

    if (code) {
      const codeLower = code.toLowerCase();
      imports = imports.filter(i => i.code && i.code.toLowerCase().includes(codeLower));
    }

    // Add supplier info and item count
    const importsWithDetails = imports.map(imp => {
      const supplier = suppliers.find(s => s.id === imp.supplierId);
      const itemCount = importItems.filter(item => item.importId === imp.id).length;

      return {
        ...imp,
        supplierName: supplier?.name || null,
        supplierPhone: supplier?.phone || null,
        supplierAddress: supplier?.address || null,
        itemCount
      };
    });

    // Sort by createdAt DESC
    importsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate totals
    const totalRecords = importsWithDetails.length;
    const totalAmount = importsWithDetails.reduce((sum, imp) => sum + (imp.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        imports: importsWithDetails,
        totalRecords,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Get imports error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/imports/:id
 * Get import details with items
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const importRecord = await jsonDB.findById('imports', id);

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        error: 'Import not found'
      });
    }

    // Get supplier info
    const supplier = await jsonDB.findById('suppliers', importRecord.supplierId);

    // Get import items
    const allItems = await jsonDB.findAll('import_items');
    const items = allItems.filter(item => item.importId === id);

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

    // Sort by createdAt
    itemsWithProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      success: true,
      data: {
        ...importRecord,
        supplierName: supplier?.name || null,
        supplierPhone: supplier?.phone || null,
        supplierAddress: supplier?.address || null,
        items: itemsWithProducts
      }
    });
  } catch (error) {
    console.error('Get import error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/imports/:id/print
 * Get import print template (HTML for printing)
 */
router.get('/:id/print', async (req, res) => {
  try {
    const { id } = req.params;

    const importRecord = await jsonDB.findById('imports', id);

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        error: 'Import not found'
      });
    }

    // Get related data
    const supplier = await jsonDB.findById('suppliers', importRecord.supplierId);
    const createdBy = await jsonDB.findById('users', importRecord.createdBy);

    const allItems = await jsonDB.findAll('import_items');
    const items = allItems.filter(item => item.importId === id);

    const products = await jsonDB.findAll('products');
    const itemsWithProducts = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        sku: product?.sku || null,
        productName: product?.name || null
      };
    });

    const importData = {
      ...importRecord,
      supplierName: supplier?.name || 'Khách lẻ',
      supplierPhone: supplier?.phone || null,
      supplierAddress: supplier?.address || null,
      createdByName: createdBy?.username || 'N/A'
    };

    // Calculate totals
    const totalQuantity = itemsWithProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalDiscount = itemsWithProducts.reduce((sum, item) => sum + (item.discount || 0), 0);
    const invoiceDiscount = importData.discountAmount || 0;
    const payableAmount = importData.totalAmount - invoiceDiscount;

    // Format datetime in Vietnamese
    const importDateTime = importData.importDateTime || importData.createdAt;
    const dtObj = new Date(importDateTime);
    const formattedDate = dtObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = dtObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Generate HTML for printing
    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu nhập hàng ${importData.code || ''}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 10px 0; font-size: 20px; }
    .info { margin-bottom: 15px; line-height: 1.6; }
    .info-row { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; text-align: center; }
    td.number { text-align: right; }
    td.center { text-align: center; }
    .totals { margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .totals-row.bold { font-weight: bold; font-size: 14px; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-around; }
    .signature-box { text-align: center; }
    .signature-line { margin-top: 80px; border-top: 1px solid #000; padding-top: 5px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PHIẾU NHẬP HÀNG</h1>
    <div><strong>Mã phiếu:</strong> ${importData.code || 'N/A'}</div>
    <div><em>Ngày: ${formattedDate} ${formattedTime}</em></div>
  </div>

  <div class="info">
    <div>Chi nhánh: <strong>Chi nhánh trung tâm</strong></div>
    <div>Người tạo: <strong>${importData.createdByName}</strong></div>
    <div>Nhà cung cấp: <strong>${importData.supplierName}</strong></div>
    ${importData.supplierPhone ? `<div>Điện thoại: ${importData.supplierPhone}</div>` : ''}
    ${importData.supplierAddress ? `<div>Địa chỉ: ${importData.supplierAddress}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">STT</th>
        <th style="width: 120px;">Mã hàng</th>
        <th>Tên hàng</th>
        <th style="width: 100px;">Đơn giá</th>
        <th style="width: 70px;">Số lượng</th>
        <th style="width: 90px;">Chiết khấu</th>
        <th style="width: 110px;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${itemsWithProducts.map((item, index) => `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${item.sku || ''}</td>
          <td>${item.productName || ''}</td>
          <td class="number">${new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
          <td class="center">${item.quantity}</td>
          <td class="number">${new Intl.NumberFormat('vi-VN').format(item.discount || 0)}</td>
          <td class="number">${new Intl.NumberFormat('vi-VN').format(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Tổng số lượng hàng:</span>
      <strong>${totalQuantity}</strong>
    </div>
    <div class="totals-row">
      <span>Tổng tiền hàng:</span>
      <strong>${new Intl.NumberFormat('vi-VN').format(importData.totalAmount)} đ</strong>
    </div>
    <div class="totals-row">
      <span>Chiết khấu sản phẩm:</span>
      <strong>${new Intl.NumberFormat('vi-VN').format(totalDiscount)} đ</strong>
    </div>
    <div class="totals-row">
      <span>Chiết khấu hóa đơn:</span>
      <strong>${new Intl.NumberFormat('vi-VN').format(invoiceDiscount)} đ</strong>
    </div>
    <div class="totals-row bold">
      <span>Tiền cần trả NCC:</span>
      <strong>${new Intl.NumberFormat('vi-VN').format(payableAmount)} đ</strong>
    </div>
  </div>

  ${importData.notes ? `<div style="margin-top: 15px;"><strong>Ghi chú:</strong> ${importData.notes}</div>` : ''}

  <div class="signatures">
    <div class="signature-box">
      <div><strong>Nhà cung cấp</strong></div>
      <div class="signature-line">(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="signature-box">
      <div><strong>Người lập</strong></div>
      <div class="signature-line">(Ký, ghi rõ họ tên)</div>
    </div>
  </div>

  <div class="no-print" style="margin-top: 20px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">In phiếu</button>
    <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">Đóng</button>
  </div>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Print import error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/imports
 * Create new import order
 * TRANSACTION: Insert import + items + update product stock
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const result = await jsonDB.transaction(async () => {
      const {
        supplierId,
        date,
        importDateTime, // New field for datetime
        items,
        notes,
        discountAmount = 0
      } = req.body;

      if (!supplierId || !items || items.length === 0) {
        throw new Error('Supplier and items are required');
      }

      // Determine import datetime: use provided value or default to NOW()
      const finalImportDateTime = importDateTime || new Date().toISOString();
      const importDate = date || formatDate(finalImportDateTime);

      // Calculate total amount (consider item discounts)
      let totalAmount = 0;
      for (const item of items) {
        const itemDiscount = item.discount || 0;
        const itemTotal = (item.quantity * item.unitPrice) - itemDiscount;
        totalAmount += itemTotal;
      }

      // Auto-generate import code
      const importCode = await jsonDB.getNextCode('PN', 'imports');

      // Create import
      const importId = generateUUID();

      const newImport = await jsonDB.insert('imports', {
        id: importId,
        code: importCode,
        supplierId,
        date: importDate,
        importDateTime: formatDateTime(finalImportDateTime),
        totalAmount,
        discountAmount,
        notes,
        createdBy: req.user.id
      });

      // Insert import items and update stock
      for (const item of items) {
        const { productId, quantity, unitPrice, discount = 0 } = item;
        const itemTotal = (quantity * unitPrice) - discount;

        // Insert import item
        const itemId = generateUUID();
        await jsonDB.insert('import_items', {
          id: itemId,
          importId,
          productId,
          quantity,
          unitPrice,
          discount,
          total: itemTotal
        });

        // Update product stock (ADD quantity)
        const product = await jsonDB.findById('products', productId);
        if (product) {
          await jsonDB.update('products', productId, {
            stockQty: (product.stockQty || 0) + quantity
          });

          // Update cost price if provided
          if (item.costPrice !== undefined) {
            await jsonDB.update('products', productId, {
              costPrice: item.costPrice
            });
          }
        }
      }

      // Get created import with supplier info
      const supplier = await jsonDB.findById('suppliers', supplierId);

      return {
        ...newImport,
        supplierName: supplier?.name || null
      };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Import created successfully and stock updated'
    });

  } catch (error) {
    console.error('Create import error:', error);

    if (error.message === 'Supplier and items are required') {
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
