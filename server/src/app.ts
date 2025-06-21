// src/app.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cafeRoutes from "./routes/cafeRoutes";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", cafeRoutes);

// ✅ FIXED: Standardized room joining logic
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // The client will send just the order ID (number)
  socket.on("join_order_room", (orderId: number) => {
    if (!orderId) return;
    const roomName = `order_${orderId}`; // ✅ Use a consistent prefix
    console.log(`📦 Socket ${socket.id} joining room: "${roomName}"`);
    socket.join(roomName);
  });

  // Listen for a ping from the client
  socket.on("client_ping", () => {
    // Respond with a pong to let the client know we are still alive
    console.log(`👂 Received ping from ${socket.id}, sending pong back.`);
    socket.emit("server_pong");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

export { app, server };
