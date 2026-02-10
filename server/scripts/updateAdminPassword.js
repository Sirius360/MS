// Test script to hash password and update users.json
import { hash Password } from '../utils/password.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        const password = 'admin123';
        const hashed = await hashPassword(password);

        console.log('Hashed password:', hashed);

        // Read users.json
        const usersPath = path.join(__dirname, '../data/users.json');
        const data = await fs.readFile(usersPath, 'utf-8');
        const users = JSON.parse(data);

        // Update admin password
        if (users.length > 0) {
            users[0].password = hashed;
            await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
            console.log('✅ Updated admin password in users.json');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
