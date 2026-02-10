import pool, { withTransaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class PurchasesRepository {
  // Generate unique purchase code
  async generatePurchaseCode() {
    const connection = await pool.getConnection();
    try {
      const year = new Date().getFullYear();
      const prefix = `PN${year}`;
      
      const [rows] = await connection.query(
        `SELECT code FROM purchase_receipts 
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

  // Get all purchase receipts
  async getAll() {
    const [rows] = await pool.query(
      `SELECT 
        pr.*,
        s.code as supplier_code,
        s.name as supplier_name,
        s.phone as supplier_phone
       FROM purchase_receipts pr
       LEFT JOIN suppliers s ON pr.supplier_id = s.id
       ORDER BY pr.created_at DESC`
    );
    return rows;
  }

  // Get purchase receipt by ID with items
  async getById(id) {
    const connection = await pool.getConnection();
    try {
      // Get receipt
      const [receipts] = await connection.query(
        `SELECT 
          pr.*,
          s.code as supplier_code,
          s.name as supplier_name,
          s.phone as supplier_phone,
          s.email as supplier_email,
          s.address as supplier_address
         FROM purchase_receipts pr
         LEFT JOIN suppliers s ON pr.supplier_id = s.id
         WHERE pr.id = ?`,
        [id]
      );

      if (receipts.length === 0) {
        return null;
      }

      const receipt = receipts[0];

      // Get items
      const [items] = await connection.query(
        `SELECT 
          pri.*,
          p.code as product_code,
          p.name as product_name,
          p.unit as product_unit
         FROM purchase_receipt_items pri
         JOIN products p ON pri.product_id = p.id
         WHERE pri.purchase_receipt_id = ?
         ORDER BY pri.created_at`,
        [id]
      );

      receipt.items = items;
      return receipt;
    } finally {
      connection.release();
    }
  }

  // Create purchase receipt with items and inventory transactions
  async create(data) {
    return withTransaction(async (connection) => {
      const id = uuidv4();
      const code = await this.generatePurchaseCode();
      const now = new Date();

      // Insert purchase receipt
      await connection.query(
        `INSERT INTO purchase_receipts 
         (id, code, supplier_id, total_amount, discount_type, discount_value, 
          other_fee, note, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        [
          id,
          code,
          data.supplier_id || null,
          data.total_amount,
          data.discount_type || 'amount',
          data.discount_value || 0,
          data.other_fee || 0,
          data.note || null,
          now,
          now
        ]
      );

      // Insert items and create inventory transactions
      for (const item of data.items) {
        const itemId = uuidv4();
        
        // Insert purchase receipt item
        await connection.query(
          `INSERT INTO purchase_receipt_items 
           (id, purchase_receipt_id, product_id, quantity, unit_price, 
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

        // Create inventory transaction (IN)
        const txId = uuidv4();
        await connection.query(
          `INSERT INTO inventory_transactions 
           (id, product_id, transaction_type, quantity, unit_cost, 
            reference_type, reference_id, created_at)
           VALUES (?, ?, 'IN', ?, ?, 'PURCHASE', ?, ?)`,
          [
            txId,
            item.product_id,
            item.quantity,
            item.unit_price,
            id,
            now
          ]
        );
      }

      // Return created receipt with items
      return await this.getById(id);
    });
  }

  // Update purchase receipt
  async update(id, data) {
    return withTransaction(async (connection) => {
      const now = new Date();

      // Check if receipt exists
      const [existing] = await connection.query(
        'SELECT * FROM purchase_receipts WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        throw new Error('Purchase receipt not found');
      }

      // Update receipt
      await connection.query(
        `UPDATE purchase_receipts 
         SET supplier_id = ?, total_amount = ?, discount_type = ?, 
             discount_value = ?, other_fee = ?, note = ?, updated_at = ?
         WHERE id = ?`,
        [
          data.supplier_id || null,
          data.total_amount,
          data.discount_type || 'amount',
          data.discount_value || 0,
          data.other_fee || 0,
          data.note || null,
          now,
          id
        ]
      );

      // Delete old items and inventory transactions
      await connection.query(
        'DELETE FROM inventory_transactions WHERE reference_id = ? AND reference_type = ?',
        [id, 'PURCHASE']
      );
      
      await connection.query(
        'DELETE FROM purchase_receipt_items WHERE purchase_receipt_id = ?',
        [id]
      );

      // Insert new items and transactions
      for (const item of data.items) {
        const itemId = uuidv4();
        
        await connection.query(
          `INSERT INTO purchase_receipt_items 
           (id, purchase_receipt_id, product_id, quantity, unit_price, 
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
           VALUES (?, ?, 'IN', ?, ?, 'PURCHASE', ?, ?)`,
          [
            txId,
            item.product_id,
            item.quantity,
            item.unit_price,
            id,
            now
          ]
        );
      }

      return await this.getById(id);
    });
  }

  // Delete purchase receipt
  async delete(id) {
    return withTransaction(async (connection) => {
      // Check if exists
      const [existing] = await connection.query(
        'SELECT * FROM purchase_receipts WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        throw new Error('Purchase receipt not found');
      }

      // Delete inventory transactions
      await connection.query(
        'DELETE FROM inventory_transactions WHERE reference_id = ? AND reference_type = ?',
        [id, 'PURCHASE']
      );

      // Delete items
      await connection.query(
        'DELETE FROM purchase_receipt_items WHERE purchase_receipt_id = ?',
        [id]
      );

      // Delete receipt
      await connection.query(
        'DELETE FROM purchase_receipts WHERE id = ?',
        [id]
      );

      return { success: true };
    });
  }
}

export default new PurchasesRepository();
