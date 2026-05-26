const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../src/models/User");

dotenv.config();

const ADMIN_USER = {
  name: "Soumya",
  email: "sr1234@gmail.com",
  password: "Soumya@2ac",
  role: "admin",
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
  const user = await User.findOneAndUpdate(
    { email: ADMIN_USER.email },
    {
      $set: {
        name: ADMIN_USER.name,
        email: ADMIN_USER.email,
        password: hashedPassword,
        role: ADMIN_USER.role,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Admin account ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
