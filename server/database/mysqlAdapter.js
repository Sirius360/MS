// ===== server/database/mysqlAdapter.js =====
// High-performance MySQL adapter with optimizations from Phase 1-3

import pool from './mysqlPool.js';
import { cache } from '../config/memoryCache.js';

class MySQLAdapter {
  constructor() {
    this.pool = pool;
  }

  // ===== OPTIMIZED READ OPERATIONS =====

  /**
   * Find by ID - with caching (O(1) from cache)
   */
  async findById(table, id, cacheTTL = 300) {
    const cacheKey = `${table}:id:${id}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    // Query database
    const [rows] = await this.pool.query(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      [id]
    );
    
    const result = rows[0] || null;
    
    // Cache result
    if (result) {
      cache.set(cacheKey, result, cacheTTL);
    }
    
    return result;
  }

  /**
   * Find all with optional filters and pagination - with caching
   */
  async findAll(table, options = {}) {
    const {
      filter = {},
      limit = 50,
      offset = 0,
      orderBy = 'createdAt',
      orderDir = 'DESC',
      cacheTTL = 60
    } = options;
    
    // Build cache key from params
    const cacheKey = `${table}:list:${JSON.stringify({ filter, limit, offset, orderBy, orderDir })}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    // Build query
    let query = `SELECT * FROM ${table}`;
    const params = [];
    
    // Add filters
    if (Object.keys(filter).length > 0) {
      const conditions = Object.entries(filter)
        .map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ordering
    query += ` ORDER BY ${orderBy} ${orderDir}`;
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Execute query
    const [rows] = await this.pool.query(query, params);
    
    // Cache results
    cache.set(cacheKey, rows, cacheTTL);
    
    return rows;
  }

  /**
   * Count records - with caching
   */
  async count(table, filter = {}, cacheTTL = 60) {
    const cacheKey = `${table}:count:${JSON.stringify(filter)}`;
    
    const cached = cache.get(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
    
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const params = [];
    
    if (Object.keys(filter).length > 0) {
      const conditions = Object.entries(filter)
        .map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const [rows] = await this.pool.query(query, params);
    const count = rows[0].count;
    
    cache.set(cacheKey, count, cacheTTL);
    
    return count;
  }

  /**
   * Search with LIKE - optimized with indexes
   */
  async search(table, searchField, searchTerm, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const [rows] = await this.pool.query(
      `SELECT * FROM ${table} WHERE ${searchField} LIKE ? LIMIT ? OFFSET ?`,
      [`%${searchTerm}%`, limit, offset]
    );
    
    return rows;
  }

  // ===== WRITE OPERATIONS WITH CACHE INVALIDATION =====

  /**
   * Insert single record
   */
  async insert(table, data) {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const record = {
      ...data,
      createdAt: data.createdAt || timestamp,
      updatedAt: data.updatedAt || timestamp,
    };
    
    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map(() => '?').join(', ');
    
    const [result] = await this.pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    // Invalidate cache
    cache.delPattern(`${table}:*`);
    
    return { ...record, insertId: result.insertId };
  }

  /**
   * Batch insert - optimized for bulk operations
   */
  async batchInsert(table, records) {
    if (!records || records.length === 0) return [];
    
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Prepare records with timestamps
    const preparedRecords = records.map(r => ({
      ...r,
      createdAt: r.createdAt || timestamp,
      updatedAt: r.updatedAt || timestamp,
    }));
    
    // Build batch insert query
    const keys = Object.keys(preparedRecords[0]);
    const placeholders = preparedRecords
      .map(() => `(${keys.map(() => '?').join(', ')})`)
      .join(', ');
    
    const values = preparedRecords.flatMap(r => keys.map(k => r[k]));
    
    const [result] = await this.pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${placeholders}`,
      values
    );
    
    // Invalidate cache
    cache.delPattern(`${table}:*`);
    
    return preparedRecords;
  }

  /**
   * Update single record
   */
  async update(table, id, updates) {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const data = {
      ...updates,
      updatedAt: timestamp,
    };
    
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    const [result] = await this.pool.query(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    // Invalidate cache
    cache.delPattern(`${table}:*`);
    cache.del(`${table}:id:${id}`);
    
    return result.affectedRows > 0;
  }

  /**
   * Batch update - optimized
   */
  async batchUpdate(table, updates) {
    if (!updates || updates.length === 0) return 0;
    
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      for (const update of updates) {
        const { id, ...data } = update;
        const updateData = { ...data, updatedAt: timestamp };
        
        const keys = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        
        await connection.query(
          `UPDATE ${table} SET ${setClause} WHERE id = ?`,
          [...values, id]
        );
      }
      
      await connection.commit();
      
      // Invalidate cache
      cache.delPattern(`${table}:*`);
      
      return updates.length;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete record (soft delete if supported)
   */
  async delete(table, id, soft = false) {
    if (soft) {
      return this.update(table, id, { isDeleted: true });
    }
    
    const [result] = await this.pool.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );
    
    // Invalidate cache
    cache.delPattern(`${table}:*`);
    cache.del(`${table}:id:${id}`);
    
    return result.affectedRows > 0;
  }

  // ===== SPECIAL QUERIES =====

  /**
   * Execute raw query with optional caching
   */
  async query(sql, params = [], cacheKey = null, cacheTTL = 60) {
    // Check cache if key provided
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    const [rows] = await this.pool.query(sql, params);
    
    // Cache if key provided
    if (cacheKey) {
      cache.set(cacheKey, rows, cacheTTL);
    }
    
    return rows;
  }

  /**
   * Execute transaction
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ===== HEALTH & STATS =====

  /**
   * Get database stats
   */
  async getStats() {
    const [tables] = await this.pool.query('SHOW TABLES');
    const stats = {
      tables: tables.length,
      records: {},
      cacheStats: cache.getStats(),
    };
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [count] = await this.pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      stats.records[tableName] = count[0].count;
    }
    
    return stats;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const [result] = await this.pool.query('SELECT 1');
      return { healthy: true, latency: 0 };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

// Export singleton instance
export const mysqlDB = new MySQLAdapter();
export default mysqlDB;
