import prisma from './src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DB ---');
        console.table(users.map(u => ({
            id: u.id,
            staffId: u.staffId,
            email: u.email,
            role: u.role,
            // Don't log full hash, just length to verify it exists
            passwordHash: u.password ? u.password.substring(0, 10) + '...' : 'NULL'
        })));

        console.log('\n--- VERIFYING ADMIN PASSWORD ---');
        const admin = users.find(u => u.role === 'ADMIN');
        if (admin) {
            console.log(`Found ADMIN: ${admin.email}`);
            // Check if password hash is valid bcrypt
            const isValidHash = admin.password && admin.password.startsWith('$2');
            console.log(`Password Hash Format Valid: ${isValidHash}`);
        } else {
            console.log('NO ADMIN USER FOUND!');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
