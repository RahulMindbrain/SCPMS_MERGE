const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findExampleUrls() {
    try {
        const resumes = await prisma.resume.findMany({
            where: {
                fileUrl: {
                    contains: 'example'
                }
            },
            select: {
                id: true,
                fileUrl: true
            }
        });
        console.log('Found with "example":', resumes.length);
        console.log(JSON.stringify(resumes, null, 2));

        const localResumes = await prisma.resume.findMany({
            where: {
                fileUrl: {
                    contains: 'uploads'
                }
            },
            select: {
                id: true,
                fileUrl: true
            }
        });
        console.log('Found with "uploads":', localResumes.length);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

findExampleUrls();
