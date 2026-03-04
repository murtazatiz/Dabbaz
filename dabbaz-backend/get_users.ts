import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
    console.log("Users in DB:");
    users.forEach(u => console.log(`${u.name} - ${u.email} - Role: ${u.role}`));
}).catch(console.error).finally(() => prisma.$disconnect());
