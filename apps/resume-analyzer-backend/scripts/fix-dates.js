const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load backend env
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.DATABASE_URL;

async function fixDates() {
    if (!MONGO_URI) {
        console.error("DATABASE_URL not found in .env");
        return;
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        const collections = ["users", "resumes", "analysis", "jobs", "applications", "faqs", "help_tickets", "system_configs"];

        for (const collName of collections) {
            console.log(`Checking collection: ${collName}...`);
            const collection = mongoose.connection.db.collection(collName);
            const cursor = collection.find({
                $or: [
                    { createdAt: { $type: "object" } },
                    { updatedAt: { $type: "object" } }
                ]
            });

            let count = 0;
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                const updates = {};

                if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.$date) {
                    updates.createdAt = new Date(doc.createdAt.$date);
                }

                if (doc.updatedAt && typeof doc.updatedAt === 'object' && doc.updatedAt.$date) {
                    updates.updatedAt = new Date(doc.updatedAt.$date);
                }

                if (Object.keys(updates).length > 0) {
                    await collection.updateOne({ _id: doc._id }, { $set: updates });
                    count++;
                }
            }
            console.log(`Fixed ${count} documents in ${collName}.`);
        }

        console.log("All malformed dates have been repaired.");
    } catch (error) {
        console.error("Error during repair:", error);
    } finally {
        await mongoose.disconnect();
    }
}

fixDates();
