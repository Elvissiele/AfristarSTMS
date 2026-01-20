import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js'; // Ensure env is loaded

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin
    const hashedPassword = await bcrypt.hash('SecurePass123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: { staffId: 'ADMIN01' },
        create: {
            email: 'john@example.com',
            staffId: 'ADMIN01',
            name: 'John Admin',
            role: 'ADMIN',
            password: hashedPassword
        },
    });
    console.log('✅ Admin user ready:', admin.email);

    // 2. Create Customer
    const customerPassword = await bcrypt.hash('password123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'elvis@example.com' },
        update: { staffId: 'M10256' },
        create: {
            email: 'elvis@example.com',
            staffId: 'M10256',
            name: 'Elvis Customer',
            role: 'CUSTOMER',
            password: customerPassword
        },
    });
    console.log('✅ Customer user ready:', customer.email);

    // 3. Create Tickets
    const ticketData = [
        {
            title: 'Login page is crashing',
            description: 'When I try to login with Safari, the page goes white.',
            priority: 'HIGH',
            status: 'OPEN',
            category: 'SOFTWARE',
            authorId: customer.id
        },
        {
            title: 'Feature Request: Dark Mode',
            description: 'Please add a dark mode to the dashboard.',
            priority: 'LOW',
            status: 'OPEN',
            category: 'OTHER',
            authorId: customer.id
        },
        {
            title: 'Password Reset Not Working',
            description: 'I clicked forgot password but never got an email.',
            priority: 'MEDIUM',
            status: 'RESOLVED',
            category: 'ACCESS',
            authorId: customer.id,
            comments: {
                create: [
                    { content: 'We checked the logs and email was sent.', authorId: admin.id, isInternal: true },
                    { content: 'Can you check your spam folder?', authorId: admin.id, isInternal: false }
                ]
            }
        },
        {
            title: 'Billing Issue',
            description: 'Charged twice for the subscription.',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            category: 'OTHER',
            authorId: customer.id,
            assignedToId: admin.id
        }
    ];

    console.log('🌱 Seeding tickets...');
    for (const t of ticketData) {
        await prisma.ticket.create({ data: t });
    }
    console.log(`✅ Added ${ticketData.length} test tickets.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
