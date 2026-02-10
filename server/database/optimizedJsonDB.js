// ===== server/database/optimizedJsonDB.js =====
// Optimized JSON database with in-memory indexing and caching

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// In-memory cache for all data
const dataCache = new Map();

// In-memory indexes for fast lookups
const indexes = new Map();

// Pending writes (debouncing)
const pendingWrites = new Map();
const WRITE_DELAY = 1000; // 1 second debounce

class OptimizedJsonDB {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize - Load all data into memory
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.ensureDataDir();
      const files = await fs.readdir(DATA_DIR);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const tableName = file.replace('.json', '');
          const data = await this.readFromFile(tableName);
          dataCache.set(tableName, data);
          this.buildIndexes(tableName, data);
        }
      }
      
      this.initialized = true;
      console.log('✅ Optimized JSON DB initialized - All data loaded into memory');
      console.log(`   Tables: ${Array.from(dataCache.keys()).join(', ')}`);
    } catch (error) {
      console.error('❌ Failed to initialize optimized DB:', error);
      throw error;
    }
  }

  /**
   * Build indexes for fast lookups - O(1) instead of O(n)
   */
  buildIndexes(tableName, data) {
    const tableIndexes = {
      byId: new Map(),
      bySku: new Map(),
      byEmail: new Map(),
      byPhone: new Map(),
    };

    data.forEach(item => {
      // Index by ID (all tables)
      if (item.id) {
        tableIndexes.byId.set(item.id, item);
      }
      
      // Index by SKU (products)
      if (item.sku) {
        tableIndexes.bySku.set(item.sku, item);
      }
      
      // Index by email (users, customers)
      if (item.email) {
        tableIndexes.byEmail.set(item.email.toLowerCase(), item);
      }
      
      // Index by phone (customers, suppliers)
      if (item.phone) {
        tableIndexes.byPhone.set(item.phone, item);
      }
    });

    indexes.set(tableName, tableIndexes);
  }

  /**
   * Ensure data directory exists
   */
  async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Get file path for table
   */
  getFilePath(tableName) {
    return path.join(DATA_DIR, `${tableName}.json`);
  }

  /**
   * Read from file (only on initialization)
   */
  async readFromFile(tableName) {
    const filePath = this.getFilePath(tableName);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Write to file (debounced and atomic)
   */
  async writeToFile(tableName, data) {
    const filePath = this.getFilePath(tableName);
    
    // Write atomically using temp file
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  /**
   * Schedule debounced write
   */
  scheduleWrite(tableName, data) {
    // Clear existing timeout
    if (pendingWrites.has(tableName)) {
      clearTimeout(pendingWrites.get(tableName));
    }

    // Schedule new write
    const timeout = setTimeout(() => {
      this.writeToFile(tableName, data)
        .then(() => {
          pendingWrites.delete(tableName);
        })
        .catch(err => {
          console.error(`Failed to write ${tableName}:`, err);
        });
    }, WRITE_DELAY);

    pendingWrites.set(tableName, timeout);
  }

  /**
   * Read data from memory cache
   */
  async readData(tableName) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (dataCache.has(tableName)) {
      return dataCache.get(tableName);
    }
    
    // Load from file if not in cache
    const data = await this.readFromFile(tableName);
    dataCache.set(tableName, data);
    this.buildIndexes(tableName, data);
    return data;
  }

  /**
   * Write data to memory + schedule file write
   */
  async writeData(tableName, data) {
    // Update memory cache immediately
    dataCache.set(tableName, data);
    this.buildIndexes(tableName, data);
    
    // Schedule async file write (debounced)
    this.scheduleWrite(tableName, data);
  }

  /**
   * Find by ID - O(1) with index
   */
  async findById(tableName, id) {
    await this.readData(tableName); // Ensure loaded
    
    const tableIndexes = indexes.get(tableName);
    if (tableIndexes?.byId) {
      return tableIndexes.byId.get(id) || null;
    }
    
    return null;
  }

  /**
   * Find by SKU - O(1) with index
   */
  async findBySKU(tableName, sku) {
    await this.readData(tableName);
    
    const tableIndexes = indexes.get(tableName);
    if (tableIndexes?.bySku) {
      return tableIndexes.bySku.get(sku) || null;
    }
    
    return null;
  }

  /**
   * Find one matching filter
   */
  async findOne(tableName, filter) {
    const data = await this.readData(tableName);
    
    return data.find(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (value === undefined) return true;
        return item[key] === value;
      });
    }) || null;
  }

  /**
   * Find all with optional filters
   */
  async findAll(tableName, filter = {}) {
    const data = await this.readData(tableName);
    
    if (Object.keys(filter).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (value === undefined) return true;
        return item[key] === value;
      });
    });
  }

  /**
   * Insert single record
   */
  async insert(tableName, record) {
    const data = await this.readData(tableName);
    const timestamp = new Date().toISOString();
    
    const newRecord = {
      ...record,
      createdAt: record.createdAt || timestamp,
      updatedAt: record.updatedAt || timestamp,
    };
    
    data.push(newRecord);
    await this.writeData(tableName, data);
    
    return newRecord;
  }

  /**
   * Batch insert - Much faster than multiple inserts
   */
  async batchInsert(tableName, records) {
    const data = await this.readData(tableName);
    const timestamp = new Date().toISOString();
    
    const newRecords = records.map(record => ({
      ...record,
      createdAt: record.createdAt || timestamp,
      updatedAt: record.updatedAt || timestamp,
    }));
    
    data.push(...newRecords);
    await this.writeData(tableName, data);
    
    return newRecords;
  }

  /**
   * Update single record
   */
  async update(tableName, id, updates) {
    const data = await this.readData(tableName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeData(tableName, data);
    return data[index];
  }

  /**
   * Batch update - Much faster than multiple updates
   */
  async batchUpdate(tableName, updates) {
    const data = await this.readData(tableName);
    const updateMap = new Map(updates.map(u => [u.id, u]));
    const timestamp = new Date().toISOString();

    const updatedData = data.map(item => {
      const update = updateMap.get(item.id);
      if (update) {
        return {
          ...item,
          ...update,
          updatedAt: timestamp,
        };
      }
      return item;
    });

    await this.writeData(tableName, updatedData);
    return updatedData.filter(item => updateMap.has(item.id));
  }

  /**
   * Soft delete
   */
  async softDelete(tableName, id) {
    const result = await this.update(tableName, id, { isDeleted: true });
    return result !== null;
  }

  /**
   * Hard delete
   */
  async hardDelete(tableName, id) {
    const data = await this.readData(tableName);
    const initialLength = data.length;
    const filtered = data.filter(item => item.id !== id);

    if (filtered.length === initialLength) {
      return false;
    }

    await this.writeData(tableName, filtered);
    return true;
  }

  /**
   * Count with optional filters
   */
  async count(tableName, filter = {}) {
    const data = await this.findAll(tableName, filter);
    return data.length;
  }

  /**
   * Get next auto-increment code
   */
  async getNextCode(prefix, tableName) {
    const counters = await this.readData('counters');
    const counterKey = `${tableName}_${prefix}`;

    let counter = counters.find(c => c.key === counterKey);

    if (!counter) {
      counter = { key: counterKey, value: 1 };
      counters.push(counter);
    } else {
      counter.value += 1;
    }

    await this.writeData('counters', counters);

    const code = prefix + String(counter.value).padStart(6, '0');
    return code;
  }

  /**
   * Flush all pending writes immediately
   */
  async flushPendingWrites() {
    const promises = [];
    
    for (const [tableName, timeout] of pendingWrites.entries()) {
      clearTimeout(timeout);
      const data = dataCache.get(tableName);
      if (data) {
        promises.push(this.writeToFile(tableName, data));
      }
    }
    
    await Promise.all(promises);
    pendingWrites.clear();
    
    console.log('✅ All pending writes flushed to disk');
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      tables: dataCache.size,
      totalRecords: 0,
      memoryUsageMB: 0,
      indexes: indexes.size,
    };

    for (const [tableName, data] of dataCache.entries()) {
      stats.totalRecords += data.length;
      stats.memoryUsageMB += JSON.stringify(data).length / 1024 / 1024;
    }

    stats.memoryUsageMB = stats.memoryUsageMB.toFixed(2);

    return stats;
  }
}

// Export singleton instance
export const optimizedDB = new OptimizedJsonDB();
export default optimizedDB;
