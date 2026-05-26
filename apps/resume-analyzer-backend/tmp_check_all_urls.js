const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllResumes() {
    try {
        const resumes = await prisma.resume.findMany({
            select: {
                id: true,
                fileName: true,
                fileUrl: true
            }
        });
        console.log(JSON.stringify(resumes, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllResumes();
