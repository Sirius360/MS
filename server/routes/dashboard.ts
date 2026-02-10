import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get total revenue (completed sales)
      const [revenueResult] = await connection.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales_invoices
        WHERE status = 'completed'
      `);
      
      // Get total purchases (completed)
      const [purchaseResult] = await connection.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_purchases
        FROM purchase_receipts
        WHERE status = 'completed'
      `);
      
      // Get total products
      const [productResult] = await connection.query(`
        SELECT COUNT(*) as total_products
        FROM products
        WHERE status = 'active'
      `);
      
      // Get low stock products (stock < 10)
      const [lowStockResult] = await connection.query(`
        SELECT COUNT(DISTINCT p.id) as low_stock_count
        FROM products p
        LEFT JOIN inventory_transactions it ON p.id = it.product_id
        WHERE p.status = 'active'
        GROUP BY p.id
        HAVING COALESCE(SUM(it.quantity), 0) < 10
      `);
      
      // Recent sales (last 7 days)
      const [recentSalesResult] = await connection.query(`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(total_amount), 0) as amount
        FROM sales_invoices
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      
      const stats = {
        total_revenue: parseFloat((revenueResult as any)[0]?.total_revenue || 0),
        total_purchases: parseFloat((purchaseResult as any)[0]?.total_purchases || 0),
        total_products: parseInt((productResult as any)[0]?.total_products || 0),
        low_stock_count: parseInt((lowStockResult as any)[0]?.low_stock_count || 0),
        recent_sales: (recentSalesResult as any[]).map((row: any) => ({
          date: row.date,
          amount: parseFloat(row.amount)
        }))
      };
      
      res.json(stats);
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
