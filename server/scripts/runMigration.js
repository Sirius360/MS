// ===== server/scripts/runMigration.js =====
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigration() {
    console.log('🚀 Starting migration...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        // Read migration file
        const migrationPath = path.join(__dirname, '../database/migration_001_add_features.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Executing migration_001_add_features.sql...\n');

        // Execute migration
        await connection.query(migration);

        console.log('✅ Migration completed successfully!\n');
        console.log('Changes applied:');
        console.log('  - Added importDateTime column to imports table');
        console.log('  - Added code columns to imports, suppliers tables');
        console.log('  - Added email column to suppliers table');
        console.log('  - Added discount column to import_items table');
        console.log('  - Added createdBy and discountAmount to imports table');
        console.log('  - Backfilled codes for existing records');
        console.log('');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration()
    .then(() => {
        console.log('🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
