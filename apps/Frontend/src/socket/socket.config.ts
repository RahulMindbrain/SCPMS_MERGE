import { io, Socket } from "socket.io-client"

// const SOCKET_URL = "http://localhost:3030";
const SOCKET_URL = "https://scpms.onrender.com"

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
})
