const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding initial configuration...");

    // 1. Seed Job Tracks
    const tracks = [
        { name: "Frontend Developer", skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js", "Tailwind CSS"] },
        { name: "Backend Developer", skills: ["Node.js", "Express", "MongoDB", "SQL", "REST APIs", "System Design"] },
        { name: "Java Developer", skills: ["Java", "Spring Boot", "SQL", "Hibernate", "Microservices"] },
        { name: "React Native Developer", skills: ["React Native", "JavaScript", "TypeScript", "Mobile UI", "Redux"] }
    ];

    for (const t of tracks) {
        await prisma.jobTrack.upsert({
            where: { name: t.name },
            update: { skills: t.skills },
            create: t
        });
    }

    // 2. Seed AI Prompts (Initial templates)
    const prompts = [
        {
            key: "analysis_fresher",
            content: "Since the candidate is a FRESHER, focus on their potential, projects, and foundational knowledge."
        },
        {
            key: "analysis_experienced",
            content: "Since the candidate is EXPERIENCED, focus on technical depth, leadership, and professional impact."
        }
    ];

    for (const p of prompts) {
        await prisma.aIPrompt.upsert({
            where: { key: p.key },
            update: { content: p.content },
            create: p
        });
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
