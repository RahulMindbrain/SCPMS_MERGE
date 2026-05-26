const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const tracks = [
        { name: "Frontend Developer", skills: ["React", "JavaScript", "CSS", "HTML", "Tailwind"] },
        { name: "Backend Developer", skills: ["Node.js", "Express", "Prisma", "MongoDB", "PostgreSQL"] },
        { name: "Full Stack Developer", skills: ["React", "Node.js", "JavaScript", "Database"] },
        { name: "Data Scientist", skills: ["Python", "TensorFlow", "Pandas", "Scikit-Learn"] },
        { name: "DevOps Engineer", skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"] },
        { name: "UI/UX Designer", skills: ["Figma", "Adobe XD", "Prototyping", "User Research"] },
        { name: "Mobile App Developer", skills: ["React Native", "Flutter", "Swift", "Kotlin"] },
        { name: "Cybersecurity Analyst", skills: ["Penetration Testing", "Ethical Hacking", "Networking"] },
        { name: "Cloud Architect", skills: ["AWS", "Azure", "GCP", "Cloud Computing"] },
        { name: "AI/ML Engineer", skills: ["Machine Learning", "Deep Learning", "LLMs", "PyTorch"] },
    ];

    for (const track of tracks) {
        await prisma.jobTrack.upsert({
            where: { name: track.name },
            update: { ...track, isActive: true },
            create: { ...track, isActive: true },
        });
    }

    console.log("Job tracks seeded successfully 🚀");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
