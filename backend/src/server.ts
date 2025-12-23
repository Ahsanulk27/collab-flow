import app from "./app";
import http from "http";
import { Server } from "socket.io";
import { prisma } from "./config/db";
import { handleChatEvents } from "./sockets/chat";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Auth token missing"));

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT secret is not configured in environment variables");
    }
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    socket.data.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err) {
    console.error("Socket auth failed:", err);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  handleChatEvents(socket, io);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
