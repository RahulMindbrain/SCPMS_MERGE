const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    const origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        process.env.CLIENT_URL,
        process.env.CLIENT_URL?.replace(/\/$/, '') // Add version without trailing slash
    ].filter(Boolean);

    console.log(`[Socket] Initializing with allowed origins:`, origins);

    io = new Server(server, {
        cors: {
            origin: origins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitEvent = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`[Socket] Emitted event: ${event}`);
    }
};

module.exports = { initSocket, getIO, emitEvent };
