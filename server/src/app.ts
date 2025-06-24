// src/app.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cafeRoutes from "./routes/cafeRoutes";
import { cleanupPendingOrders } from "./controllers/cafeController";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);



const CLIENT_URL = process.env.CLIENT_URL 
console.log(`✅ Client URL is set to: ${CLIENT_URL}`);


const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", cafeRoutes);

// ✅ 3. Schedule the cron job to run every minute
cron.schedule("* * * * *", async () => {
  // The '*' characters mean "every minute of every hour of every day..."
  console.log("⏰ Cron job triggered by schedule.");
  await cleanupPendingOrders();
});

console.log("✅ Cron job for cleaning up pending orders has been scheduled to run every minute.")

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
