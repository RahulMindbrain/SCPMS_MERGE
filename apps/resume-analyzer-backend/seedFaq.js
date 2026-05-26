const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.faq.createMany({
    data: [
      {
        question: "What is this platform?",
        answer: "This is a job matching system.",
        category: "GENERAL",
      },
      {
        question: "Is this free?",
        answer: "Yes, it's completely free.",
        category: "GENERAL",
      },
      {
        question: "How to apply for jobs?",
        answer: "Go to jobs section and click apply.",
        category: "JOB",
      },
    ],
  });

  console.log("FAQs inserted successfully 🚀");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
