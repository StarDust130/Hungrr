// src/app.ts

// =============================================
// IMPORTS
// =============================================
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";

// Import local modules
import cafeRoutes from "./routes/cafeRoutes";
import adminRoutes from "./routes/adminRoutes";
import statsRoutes from "./routes/statsRoutes";
import { cleanupPendingOrders } from "./controllers/cronjobController";

// =============================================
// INITIALIZATION & ENVIRONMENT
// =============================================
dotenv.config();
const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL;

// =============================================
// MIDDLEWARE
// =============================================
// ✅ FIX: Call express.json() and express.urlencoded() ONLY ONCE
// with the desired limit. This MUST come before your routes.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Then, configure CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// =============================================
// SOCKET.IO SETUP
// =============================================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
// Make io accessible in route handlers via req.app.get('io')
app.set("io", io);

// =============================================
// API ROUTES
// =============================================
app.use("/api", cafeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// =============================================
// CRON JOB
// =============================================
cron.schedule("* * * * *", async () => {
  console.log("⏰ Cron job: Cleaning up pending orders.");
  await cleanupPendingOrders();
});
console.log("✅ Cron job scheduled to run every minute.");

// =============================================
// SOCKET.IO EVENT HANDLERS
// =============================================
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join_order_room", (orderId: number) => {
    if (!orderId) return;
    const roomName = `order_${orderId}`;
    console.log(`📦 Socket ${socket.id} joining room: "${roomName}"`);
    socket.join(roomName);
  });

  socket.on("client_ping", () => {
    console.log(`👂 Received ping from ${socket.id}, sending pong back.`);
    socket.emit("server_pong");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// =============================================
// EXPORTS
// =============================================
export { app, server };
