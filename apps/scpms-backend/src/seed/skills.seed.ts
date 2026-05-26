import prisma from "../config/db";

async function seedSkills() {
  const skills = [
    // Programming Languages
    { name: "C" },
    { name: "C++" },
    { name: "Java" },
    { name: "Python" },
    { name: "JavaScript" },
    { name: "TypeScript" },
    { name: "Go" },
    { name: "Rust" },
    { name: "Kotlin" },
    { name: "Swift" },
    { name: "PHP" },
    { name: "Ruby" },
    { name: "R" },
    { name: "Scala" },
    { name: "Perl" },

    // Frontend
    { name: "HTML" },
    { name: "CSS" },
    { name: "Tailwind CSS" },
    { name: "Bootstrap" },
    { name: "React" },
    { name: "Next.js" },
    { name: "Angular" },
    { name: "Vue.js" },
    { name: "Redux" },
    { name: "jQuery" },

    // Backend
    { name: "Node.js" },
    { name: "Express.js" },
    { name: "NestJS" },
    { name: "Spring Boot" },
    { name: "Django" },
    { name: "Flask" },
    { name: "FastAPI" },
    { name: "Laravel" },
    { name: "ASP.NET" },

    // Databases
    { name: "MySQL" },
    { name: "PostgreSQL" },
    { name: "MongoDB" },
    { name: "NoSQL" },
    { name: "Redis" },
    { name: "SQLite" },
    { name: "Oracle DB" },
    { name: "Microsoft SQL Server" },
    { name: "Firebase" },

    // ORM / Database Tools
    { name: "Prisma" },
    { name: "Mongoose" },
    { name: "TypeORM" },
    { name: "Sequelize" },
    { name: "Hibernate" },

    // DevOps / Cloud
    { name: "AWS" },
    { name: "Google Cloud Platform" },
    { name: "Microsoft Azure" },
    { name: "Docker" },
    { name: "Kubernetes" },
    { name: "Jenkins" },
    { name: "GitHub Actions" },
    { name: "CI/CD" },
    { name: "Linux" },
    { name: "Nginx" },

    // Testing
    { name: "JUnit" },
    { name: "Selenium" },
    { name: "Playwright" },
    { name: "Cypress" },
    { name: "Jest" },
    { name: "Mocha" },
    { name: "Chai" },
    { name: "Unit Testing" },
    { name: "Integration Testing" },
    { name: "Regression Testing" },
    { name: "Load Testing" },

    // AI / ML / Data
    { name: "Machine Learning" },
    { name: "Deep Learning" },
    { name: "TensorFlow" },
    { name: "PyTorch" },
    { name: "OpenCV" },
    { name: "Natural Language Processing" },
    { name: "Data Analysis" },
    { name: "Data Visualization" },
    { name: "Pandas" },
    { name: "NumPy" },
    { name: "Scikit-learn" },

    // Monitoring / Logging
    { name: "Grafana" },
    { name: "Prometheus" },
    { name: "ELK Stack" },
    { name: "Splunk" },

    // APIs
    { name: "REST API" },
    { name: "GraphQL" },
    { name: "gRPC" },

    // Version Control / Collaboration
    { name: "Git" },
    { name: "GitHub" },
    { name: "GitLab" },
    { name: "Bitbucket" },

    // Mobile
    { name: "Android Development" },
    { name: "iOS Development" },
    { name: "React Native" },
    { name: "Flutter" },

    // Cybersecurity
    { name: "Ethical Hacking" },
    { name: "Penetration Testing" },
    { name: "Network Security" },
    { name: "Cryptography" },

    // Networking
    { name: "Computer Networks" },
    { name: "TCP/IP" },
    { name: "DNS" },
    { name: "HTTP/HTTPS" },

    // Soft Skills
    { name: "Problem Solving" },
    { name: "Communication" },
    { name: "Leadership" },
    { name: "Teamwork" },
    { name: "Project Management" },
    { name: "Time Management" },
    { name: "Critical Thinking" },
  ];
  await prisma.skill.deleteMany({});

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log("🎉 Skills Seeded Successfully");
}

seedSkills()
  .catch((e) => {
    console.log("💀 Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
