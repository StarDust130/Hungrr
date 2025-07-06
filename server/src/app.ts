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
import userRoutes from "./routes/userRoutes";
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
const ADMIN_URL = process.env.ADMIN_URL;
const KITCHEN_URL = process.env.KITCHEN_URL;

const allowedOrigins = [CLIENT_URL, ADMIN_URL, KITCHEN_URL];

// =============================================
// MIDDLEWARE
// =============================================
// ✅ FIX: Call express.json() and express.urlencoded() ONLY ONCE
// with the desired limit. This MUST come before your routes.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Then, configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// =============================================
// SOCKET.IO SETUP
// =============================================
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Socket.IO CORS blocked"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Make io accessible in route handlers via req.app.get('io')
app.set("io", io);

// =============================================
// API ROUTES
// =============================================
app.use("/api", userRoutes);
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
// --- Socket.IO Event Handlers ---
io.on("connection", (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  // Event for a client (like the kitchen screen) to join a room for a specific cafe
  socket.on("join_cafe_room", (cafeId: string | number) => {
    if (!cafeId) {
      console.error(`🔴 Attempted to join a room with invalid cafeId from socket ${socket.id}`);
      return;
    }
    const roomName = `cafe_${cafeId}`;
    socket.join(roomName);
    console.log(`📦 Socket ${socket.id} joined room: "${roomName}"`);
  });

  // Event for a client to leave a room
  socket.on("leave_cafe_room", (cafeId: string | number) => {
     if (!cafeId) return;
     const roomName = `cafe_${cafeId}`;
     socket.leave(roomName);
     console.log(`🚪 Socket ${socket.id} left room: "${roomName}"`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// =============================================
// EXPORTS
// =============================================
export { app, server };
