const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function disableMaintenance() {
    try {
        console.log("Checking for system configuration...");
        const config = await prisma.systemConfig.findFirst();

        if (!config) {
            console.log("No configuration found. Creating default...");
            await prisma.systemConfig.create({
                data: { maintenanceMode: false }
            });
            console.log("Maintenance mode is now DISABLED (default).");
        } else {
            console.log("Configuration found. Disabling maintenance mode...");
            await prisma.systemConfig.update({
                where: { id: config.id },
                data: { maintenanceMode: false }
            });
            console.log("Maintenance mode has been successfully DISABLED.");
        }
    } catch (error) {
        console.error("Error during repair:", error);
    } finally {
        await prisma.$disconnect();
    }
}

disableMaintenance();
