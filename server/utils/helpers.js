// ===== server/utils/helpers.js =====
import { randomUUID } from 'crypto';
import pool from '../database/connection.js';

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function generateUUID() {
    return randomUUID();
}

/**
 * Format date for MySQL DATE field
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
export function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format datetime for MySQL DATETIME field
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted datetime (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate discount amount
 * @param {number} subtotal - Subtotal amount
 * @param {string} discountType - 'percent' or 'amount'
 * @param {number} discountValue - Discount value
 * @returns {number} Discount amount
 */
export function calculateDiscount(subtotal, discountType, discountValue) {
    if (discountType === 'percent') {
        return (subtotal * discountValue) / 100;
    }
    return discountValue;
}

/**
 * Generate code with prefix and number
 * @param {string} prefix - Code prefix (e.g., 'PROD', 'IMP', 'INV')
 * @param {number} number - Sequential number
 * @param {number} padding - Number of digits (default: 5)
 * @returns {string} Generated code (e.g., 'PROD00001')
 */
export function generateCode(prefix, number, padding = 5) {
    return `${prefix}${String(number).padStart(padding, '0')}`;
}

/**
 * Generate next sequential code for a table
 * Uses database locking to prevent duplicates
 * @param {string} prefix - Code prefix (e.g., 'PN', 'SP', 'NCC')
 * @param {string} tableName - Table name
 * @param {string} columnName - Column name containing the code
 * @param {number} padLength - Number of digits for padding (default: 6)
 * @returns {Promise<string>} Generated code (e.g., 'PN000001')
 */
export async function generateNextCode(prefix, tableName, columnName, padLength = 6) {
    const connection = await pool.getConnection();

    try {
        // Lock the table for reading to prevent race conditions
        await connection.query(`LOCK TABLES ${tableName} READ`);

        // Get the maximum existing code
        const [rows] = await connection.query(
            `SELECT ${columnName} as code FROM ${tableName} 
             WHERE ${columnName} LIKE ? 
             ORDER BY ${columnName} DESC 
             LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNumber = 1;

        if (rows.length > 0 && rows[0].code) {
            // Extract number from existing code (e.g., 'PN000123' -> 123)
            const currentCode = rows[0].code;
            const numberPart = currentCode.substring(prefix.length);
            const currentNumber = parseInt(numberPart, 10);

            if (!isNaN(currentNumber)) {
                nextNumber = currentNumber + 1;
            }
        }

        // Generate new code
        const newCode = prefix + String(nextNumber).padStart(padLength, '0');

        return newCode;

    } finally {
        await connection.query('UNLOCK TABLES');
        connection.release();
    }
}

/**
 * Calculate sale price from before-tax price and VAT
 * @param {number} priceBeforeTax - Price before tax
 * @param {number} vatPercent - VAT percentage
 * @returns {number} Price after tax
 */
export function calculatePriceWithVAT(priceBeforeTax, vatPercent) {
    return priceBeforeTax * (1 + vatPercent / 100);
}
