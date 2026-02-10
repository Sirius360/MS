// ===== server/routes/dashboard.js =====
import express from 'express';
import * as jsonDB from '../database/jsonDB.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const invoices = await jsonDB.findAll('invoices');
    const products = await jsonDB.findAll('products', { isDeleted: false });
    const invoiceItems = await jsonDB.findAll('invoice_items');

    // Filter invoices by date range if provided
    let filteredInvoices = invoices;
    if (fromDate && toDate) {
      filteredInvoices = invoices.filter(inv =>
        inv.date >= fromDate && inv.date <= toDate
      );
    }

    // Calculate summary stats
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalOrders = filteredInvoices.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockQty < p.minStock).length;

    // Get revenue by day
    const revenueByDay = {};
    filteredInvoices.forEach(inv => {
      const date = inv.date.split('T')[0]; // Get date part only
      if (!revenueByDay[date]) {
        revenueByDay[date] = { date, revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += inv.totalAmount || 0;
      revenueByDay[date].orders += 1;
    });

    const revenueByDayArray = Object.values(revenueByDay)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    // Get top products
    const productSales = {};

    // Filter invoice items by date range
    const filteredInvoiceIds = new Set(filteredInvoices.map(inv => inv.id));
    const filteredItems = invoiceItems.filter(item => filteredInvoiceIds.has(item.invoiceId));

    filteredItems.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          totalSold: 0,
          revenue: 0
        };
      }
      productSales[item.productId].totalSold += item.quantity;
      productSales[item.productId].revenue += item.total || 0;
    });

    const topProductsData = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Add product details
    const topProducts = topProductsData.map(ps => {
      const product = products.find(p => p.id === ps.productId);
      return {
        ...ps,
        sku: product?.sku || null,
        productName: product?.name || null
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          totalProducts,
          lowStockProducts
        },
        revenueByDay: revenueByDayArray,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
