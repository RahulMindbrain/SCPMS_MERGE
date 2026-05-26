import prisma from "../config/db";

async function main() {
  const departments = [
    // Computer / Software
    { name: "Computer Science Engineering" },
    { name: "Computer Science and Engineering" },
    { name: "Computer Engineering" },
    { name: "Information Technology" },
    { name: "Software Engineering" },
    { name: "Artificial Intelligence" },
    { name: "Artificial Intelligence and Machine Learning" },
    { name: "Data Science" },
    { name: "Cyber Security" },
    { name: "Cyber Security and Forensics" },
    { name: "Cloud Computing" },
    { name: "Blockchain Technology" },
    { name: "Internet of Things" },

    // Electronics / Electrical
    { name: "Electronics and Communication Engineering" },
    { name: "Electronics Engineering" },
    { name: "Electrical Engineering" },
    { name: "Electrical and Electronics Engineering" },
    { name: "Electronics and Instrumentation Engineering" },
    { name: "Instrumentation Engineering" },

    // Mechanical / Core
    { name: "Mechanical Engineering" },
    { name: "Civil Engineering" },
    { name: "Chemical Engineering" },
    { name: "Production Engineering" },
    { name: "Industrial Engineering" },
    { name: "Manufacturing Engineering" },
    { name: "Automobile Engineering" },
    { name: "Aeronautical Engineering" },
    { name: "Aerospace Engineering" },
    { name: "Metallurgical Engineering" },
    { name: "Mining Engineering" },
    { name: "Petroleum Engineering" },
    { name: "Marine Engineering" },

    // Emerging / Specialized
    { name: "Biomedical Engineering" },
    { name: "Biotechnology Engineering" },
    { name: "Environmental Engineering" },
    { name: "Agricultural Engineering" },
    { name: "Food Technology" },
    { name: "Robotics Engineering" },
    { name: "Mechatronics Engineering" },

    // Science
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Mathematics" },
    { name: "Statistics" },
    { name: "Data Analytics" },

    // Commerce / Management
    { name: "Bachelor of Business Administration" },
    { name: "Business Administration" },
    { name: "Finance" },
    { name: "Accounting" },
    { name: "Marketing" },
    { name: "Human Resource Management" },
    { name: "Operations Management" },

    // Arts / Humanities
    { name: "English" },
    { name: "Economics" },
    { name: "Political Science" },
    { name: "Psychology" },
    { name: "Sociology" },
    { name: "History" },

    // Medical / Pharmacy
    { name: "Pharmacy" },
    { name: "Nursing" },
    { name: "Medicine" },
    { name: "Dentistry" },

    // Law / Design
    { name: "Law" },
    { name: "Architecture" },
    { name: "Fashion Design" },
    { name: "Graphic Design" },
    { name: "Interior Design" },

    // General
    { name: "Master of Computer Applications" },
    { name: "Bachelor of Computer Applications" },
    { name: "Master of Business Administration" },
  ];
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name }, // 🔥 unique field
      update: {},
      create: dept,
    });
  }

  console.log("✅ Departments seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
