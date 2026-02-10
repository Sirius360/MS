// ===== server/scripts/hashPassword.js =====
// Script to generate hashed password for admin user
import { hashPassword } from '../utils/password.js';

const password = 'admin123';

hashPassword(password).then(hashed => {
    console.log('Password:', password);
    console.log('Hashed:', hashed);
    console.log('\nCopy this hash to server/data/users.json');
}).catch(err => {
    console.error('Error:', err);
});
