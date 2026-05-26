import prisma from "../config/db";

const connectToDb = async () => {
  try {
    await prisma.$connect();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }
};

export default connectToDb;
