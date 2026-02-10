// ===== server/database/jsonDB.js =====
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// In-memory locks for transaction support
const locks = new Map();

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

/**
 * Get file path for a table
 */
function getFilePath(tableName) {
    return path.join(DATA_DIR, `${tableName}.json`);
}

/**
 * Read data from JSON file
 * @param {string} tableName - Name of the table/file
 * @returns {Promise<Array>} Array of records
 */
export async function readData(tableName) {
    await ensureDataDir();
    const filePath = getFilePath(tableName);

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        throw error;
    }
}

/**
 * Write data to JSON file
 * @param {string} tableName - Name of the table/file
 * @param {Array} data - Array of records to write
 */
export async function writeData(tableName, data) {
    await ensureDataDir();
    const filePath = getFilePath(tableName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Insert a new record
 * @param {string} tableName - Name of the table
 * @param {Object} record - Record to insert
 * @returns {Promise<Object>} Inserted record
 */
export async function insert(tableName, record) {
    const data = await readData(tableName);
    const newRecord = {
        ...record,
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: record.updatedAt || new Date().toISOString()
    };
    data.push(newRecord);
    await writeData(tableName, data);
    return newRecord;
}

/**
 * Update a record by ID
 * @param {string} tableName - Name of the table
 * @param {string} id - ID of the record to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated record or null if not found
 */
export async function update(tableName, id, updates) {
    const data = await readData(tableName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return null;
    }

    data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await writeData(tableName, data);
    return data[index];
}

/**
 * Soft delete a record (set isDeleted = true)
 * @param {string} tableName - Name of the table
 * @param {string} id - ID of the record to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function softDelete(tableName, id) {
    const result = await update(tableName, id, { isDeleted: true });
    return result !== null;
}

/**
 * Hard delete a record (remove from file)
 * @param {string} tableName - Name of the table
 * @param {string} id - ID of the record to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function hardDelete(tableName, id) {
    const data = await readData(tableName);
    const initialLength = data.length;
    const filtered = data.filter(item => item.id !== id);

    if (filtered.length === initialLength) {
        return false;
    }

    await writeData(tableName, filtered);
    return true;
}

/**
 * Find a record by ID
 * @param {string} tableName - Name of the table
 * @param {string} id - ID to search for
 * @returns {Promise<Object|null>} Found record or null
 */
export async function findById(tableName, id) {
    const data = await readData(tableName);
    return data.find(item => item.id === id) || null;
}

/**
 * Find one record matching filter
 * @param {string} tableName - Name of the table
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Object|null>} Found record or null
 */
export async function findOne(tableName, filter) {
    const data = await readData(tableName);
    return data.find(item => matchesFilter(item, filter)) || null;
}

/**
 * Find all records matching filter
 * @param {string} tableName - Name of the table
 * @param {Object} filter - Filter criteria (optional)
 * @returns {Promise<Array>} Array of matching records
 */
export async function findAll(tableName, filter = {}) {
    const data = await readData(tableName);

    if (Object.keys(filter).length === 0) {
        return data;
    }

    return data.filter(item => matchesFilter(item, filter));
}

/**
 * Check if a record matches filter criteria
 * @param {Object} record - Record to check
 * @param {Object} filter - Filter criteria
 * @returns {boolean} True if matches
 */
function matchesFilter(record, filter) {
    return Object.entries(filter).every(([key, value]) => {
        if (value === undefined) return true;
        return record[key] === value;
    });
}

/**
 * Get next auto-increment code
 * @param {string} prefix - Code prefix (e.g., 'PN', 'SP', 'NCC')
 * @param {string} tableName - Table name to get counter for
 * @returns {Promise<string>} Next code (e.g., 'PN000001')
 */
export async function getNextCode(prefix, tableName) {
    const counters = await readData('counters');
    const counterKey = `${tableName}_${prefix}`;

    let counter = counters.find(c => c.key === counterKey);

    if (!counter) {
        counter = { key: counterKey, value: 1 };
        counters.push(counter);
    } else {
        counter.value += 1;
    }

    await writeData('counters', counters);

    const code = prefix + String(counter.value).padStart(6, '0');
    return code;
}

/**
 * Execute operations in a transaction
 * Provides simple locking mechanism to prevent concurrent writes
 * @param {Function} callback - Async function to execute
 * @returns {Promise<any>} Result of callback
 */
export async function transaction(callback) {
    const lockId = Date.now() + Math.random();

    // Wait for any existing locks to clear
    while (locks.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Acquire lock
    locks.set(lockId, true);

    try {
        const result = await callback();
        return result;
    } finally {
        // Release lock
        locks.delete(lockId);
    }
}

/**
 * Join data from related tables (like SQL JOIN)
 * @param {string} tableName - Main table
 * @param {Object} joins - Join configuration
 * @returns {Promise<Array>} Joined data
 */
export async function join(tableName, joins = []) {
    const mainData = await readData(tableName);

    for (const joinConfig of joins) {
        const { table: joinTable, localField, foreignField, as } = joinConfig;
        const joinData = await readData(joinTable);

        // Create a map for faster lookup
        const joinMap = new Map();
        joinData.forEach(item => {
            joinMap.set(item[foreignField], item);
        });

        // Add joined data to main records
        mainData.forEach(record => {
            const joinedRecord = joinMap.get(record[localField]);
            record[as] = joinedRecord || null;
        });
    }

    return mainData;
}

export default {
    readData,
    writeData,
    insert,
    update,
    softDelete,
    hardDelete,
    findById,
    findOne,
    findAll,
    getNextCode,
    transaction,
    join
};
