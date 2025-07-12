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
import kitchenRoutes from "./routes/kitchenRoutes";
import { cleanupPendingOrders } from "./controllers/cronjobController";

// =============================================
// INITIALIZATION & ENVIRONMENT
// =============================================
dotenv.config();
const app = express();
const server = http.createServer(app);

// It's best practice to define fallbacks for environment variables
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3001";
const KITCHEN_URL = process.env.KITCHEN_URL || "http://localhost:3002";

const allowedOrigins = [CLIENT_URL, ADMIN_URL, KITCHEN_URL];

// =============================================
// MIDDLEWARE
// =============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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
    origin: allowedOrigins,
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
app.use("/api/kitchen", kitchenRoutes);

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
  console.log(`🟢 New client connected: ${socket.id}`);

  // Handler for the ADMIN/KITCHEN dashboard to join a room for an entire cafe
  socket.on("join_cafe_room", (cafeId: string | number) => {
    if (!cafeId) {
      console.error(
        `🔴 Attempted to join a room with invalid cafeId from socket ${socket.id}`
      );
      return;
    }
    const roomName = `cafe_${cafeId}`;
    socket.join(roomName);
    console.log(`📦 Socket ${socket.id} joined CAFE room: "${roomName}"`);
  });

  // ✅ NEW: Handler for the USER website to join a room for a SINGLE order
  socket.on("join_order_room", (orderId: string | number) => {
    if (!orderId) {
      console.error(
        `🔴 Attempted to join a room with invalid orderId from socket ${socket.id}`
      );
      return;
    }
    const roomName = `order_${orderId}`;
    socket.join(roomName);
    console.log(`📦 Socket ${socket.id} joined ORDER room: "${roomName}"`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// =============================================
// EXPORTS
// =============================================
export { app, server };
