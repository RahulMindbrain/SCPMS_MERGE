import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server;

type JoinPayload = {
  userId: number;
  role: "STUDENT" | "COMPANY" | "ADMIN";
};

export const initializeSocket = (server: HTTPServer): void => {
  io = new Server(server, {
    cors: {
      origin: [
      "http://localhost:5173",
      "https://scpms.pages.dev",
      "https://7132f00b.scpms.pages.dev",
    ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("join", (data: JoinPayload) => {
      try {
        const { userId, role } = data;

        console.log("JOIN RECEIVED:", userId, role);

        if (!userId || !role) {
          socket.emit("error", { message: "Invalid join data" });
          return;
        }

        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);

        console.log(`✅ Joined rooms: user:${userId}, role:${role}`);
      } catch (error) {
        console.error("Join error:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", socket.id, "Reason:", reason);
    });
  });
};

const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitToUser = (
  userId: number,
  event: string,
  data: unknown,
): void => {
  const io = getIO();

  if (!userId) {
    console.log("❌ userId missing");
    return;
  }

  console.log(`📤 Emitting to user:${userId} → ${event}`);

  io.to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (
  role: "STUDENT" | "COMPANY" | "ADMIN",
  event: string,
  data: unknown,
): void => {
  const io = getIO();

  console.log(`📤 Emitting to role:${role} → ${event}`);

  io.to(`role:${role}`).emit(event, data);
};

export const emitToUsers = (
  userIds: number[],
  event: string,
  data: unknown,
): void => {
  const io = getIO();

  if (!Array.isArray(userIds)) return;

  userIds.forEach((id) => {
    console.log(`📤 Emitting to user:${id} → ${event}`);
    io.to(`user:${id}`).emit(event, data);
  });
};
