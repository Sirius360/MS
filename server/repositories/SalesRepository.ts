import pool, { withTransaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class SalesRepository {
  // Generate unique sales code
  async generateSalesCode() {
    const connection = await pool.getConnection();
    try {
      const year = new Date().getFullYear();
      const prefix = `HD${year}`;
      
      const [rows] = await connection.query(
        `SELECT code FROM sales_invoices 
         WHERE code LIKE ? 
         ORDER BY code DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let nextNumber = 1;
      if (rows.length > 0) {
        const lastCode = rows[0].code;
        const lastNumber = parseInt(lastCode.replace(prefix, ''));
        nextNumber = lastNumber + 1;
      }
      
      return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    } finally {
      connection.release();
    }
  }

  // Get all sales invoices
  async getAll() {
    const [rows] = await pool.query(
      `SELECT 
        si.*,
        c.code as customer_code,
        c.name as customer_name,
        c.phone as customer_phone
       FROM sales_invoices si
       LEFT JOIN customers c ON si.customer_id = c.id
       ORDER BY si.created_at DESC`
    );
    return rows;
  }

  // Get sales invoice by ID with items
  async getById(id) {
    const connection = await pool.getConnection();
    try {
      // Get invoice
      const [invoices] = await connection.query(
        `SELECT 
          si.*,
          c.code as customer_code,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email,
          c.address as customer_address
         FROM sales_invoices si
         LEFT JOIN customers c ON si.customer_id = c.id
         WHERE si.id = ?`,
        [id]
      );

      if (invoices.length === 0) {
        return null;
      }

      const invoice = invoices[0];

      // Get items
      const [items] = await connection.query(
        `SELECT 
          sii.*,
          p.code as product_code,
          p.name as product_name,
          p.unit as product_unit
         FROM sales_invoice_items sii
         JOIN products p ON sii.product_id = p.id
         WHERE sii.sales_invoice_id = ?
         ORDER BY sii.created_at`,
        [id]
      );

      invoice.items = items;
      return invoice;
    } finally {
      connection.release();
    }
  }

  // Create sales invoice with items and inventory
    async create(data) {
    return withTransaction(async (connection) => {
      const id = uuidv4();
      const code = await this.generateSalesCode();
      const now = new Date();

      // Insert sales invoice
      await connection.query(
        `INSERT INTO sales_invoices 
         (id, code, customer_id, total_amount, discount_type, discount_value, 
          payment_method, paid_amount, note, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        [
          id,
          code,
          data.customer_id || null,
          data.total_amount,
          data.discount_type || 'amount',
          data.discount_value || 0,
          data.payment_method || 'cash',
          data.paid_amount || data.total_amount,
          data.note || null,
          now,
          now
        ]
      );

      // Insert items and create inventory transactions
      for (const item of data.items) {
        const itemId = uuidv4();
        
        // Insert sales invoice item
        await connection.query(
          `INSERT INTO sales_invoice_items 
           (id, sales_invoice_id, product_id, quantity, unit_price, 
            discount, total_amount, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.total_amount,
            now,
            now
          ]
        );

        // Create inventory transaction (OUT)
        const txId = uuidv4();
        await connection.query(
          `INSERT INTO inventory_transactions 
           (id, product_id, transaction_type, quantity, unit_cost, 
            reference_type, reference_id, created_at)
           VALUES (?, ?, 'OUT', ?, ?, 'SALE', ?, ?)`,
          [
            txId,
            item.product_id,
            -Math.abs(item.quantity), // Negative for OUT
            item.unit_price,
            id,
            now
          ]
        );
      }

      // Return created invoice with items
      return await this.getById(id);
    });
  }

  // Update sales invoice
  async update(id, data) {
    return withTransaction(async (connection) => {
      const now = new Date();

      // Check if invoice exists
      const [existing] = await connection.query(
        'SELECT * FROM sales_invoices WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        throw new Error('Sales invoice not found');
      }

      // Update invoice
      await connection.query(
        `UPDATE sales_invoices 
         SET customer_id = ?, total_amount = ?, discount_type = ?, 
             discount_value = ?, payment_method = ?, paid_amount = ?, 
             note = ?, updated_at = ?
         WHERE id = ?`,
        [
          data.customer_id || null,
          data.total_amount,
          data.discount_type || 'amount',
          data.discount_value || 0,
          data.payment_method || 'cash',
          data.paid_amount || data.total_amount,
          data.note || null,
          now,
          id
        ]
      );

      // Delete old items and inventory transactions
      await connection.query(
        'DELETE FROM inventory_transactions WHERE reference_id = ? AND reference_type = ?',
        [id, 'SALE']
      );
      
      await connection.query(
        'DELETE FROM sales_invoice_items WHERE sales_invoice_id = ?',
        [id]
      );

      // Insert new items and transactions
      for (const item of data.items) {
        const itemId = uuidv4();
        
        await connection.query(
          `INSERT INTO sales_invoice_items 
           (id, sales_invoice_id, product_id, quantity, unit_price, 
            discount, total_amount, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.total_amount,
            now,
            now
          ]
        );

        const txId = uuidv4();
        await connection.query(
          `INSERT INTO inventory_transactions 
           (id, product_id, transaction_type, quantity, unit_cost, 
            reference_type, reference_id, created_at)
           VALUES (?, ?, 'OUT', ?, ?, 'SALE', ?, ?)`,
          [
            txId,
            item.product_id,
            -Math.abs(item.quantity),
            item.unit_price,
            id,
            now
          ]
        );
      }

      return await this.getById(id);
    });
  }

  // Delete sales invoice
  async delete(id) {
    return withTransaction(async (connection) => {
      // Check if exists
      const [existing] = await connection.query(
        'SELECT * FROM sales_invoices WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        throw new Error('Sales invoice not found');
      }

      // Delete inventory transactions
      await connection.query(
        'DELETE FROM inventory_transactions WHERE reference_id = ? AND reference_type = ?',
        [id, 'SALE']
      );

      // Delete items
      await connection.query(
        'DELETE FROM sales_invoice_items WHERE sales_invoice_id = ?',
        [id]
      );

      // Delete invoice
      await connection.query(
        'DELETE FROM sales_invoices WHERE id = ?',
        [id]
      );

      return { success: true };
    });
  }
}

export default new SalesRepository();
