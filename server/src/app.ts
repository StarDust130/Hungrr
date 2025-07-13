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

// Normalize function to avoid trailing slash issues
const normalizeOrigin = (origin: string) => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin;
  }
};

// Set default client/admin URLs
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3001";
const KITCHEN_URL = process.env.KITCHEN_URL || "http://localhost:3002";

// Add all allowed origins explicitly
const allowedOrigins = [
  normalizeOrigin(CLIENT_URL),
  normalizeOrigin(ADMIN_URL),
  normalizeOrigin(KITCHEN_URL),
];

// =============================================
// MIDDLEWARE
// =============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow server-to-server or curl/Postman requests
        return callback(null, true);
      }

      const cleaned = normalizeOrigin(origin);

      if (allowedOrigins.includes(cleaned)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS Blocked: ${cleaned}`);
        return callback(new Error("Not allowed by CORS"));
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
// SOCKET.IO EVENTS
// =============================================
io.on("connection", (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  socket.on("join_cafe_room", (cafeId: string | number) => {
    if (!cafeId) {
      console.error(`🔴 Invalid cafeId from socket ${socket.id}`);
      return;
    }
    const room = `cafe_${cafeId}`;
    socket.join(room);
    console.log(`📦 ${socket.id} joined room: ${room}`);
  });

  socket.on("join_order_room", (orderId: string | number) => {
    if (!orderId) {
      console.error(`🔴 Invalid orderId from socket ${socket.id}`);
      return;
    }
    const room = `order_${orderId}`;
    socket.join(room);
    console.log(`📦 ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Disconnected: ${socket.id} (${reason})`);
  });
});

// =============================================
// EXPORTS
// =============================================
export { app, server };
