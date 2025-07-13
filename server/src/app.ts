// =============================================
// IMPORTS
// =============================================
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";

// Route modules
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import statsRoutes from "./routes/statsRoutes";
import kitchenRoutes from "./routes/kitchenRoutes";
import { cleanupPendingOrders } from "./controllers/cronjobController";

// =============================================
// INITIALIZATION
// =============================================
dotenv.config();
const app = express();
const server = http.createServer(app);

// =============================================
// ORIGIN NORMALIZATION
// =============================================
const normalizeOrigin = (origin: string): string => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin;
  }
};

const CLIENT_URL = normalizeOrigin(
  process.env.CLIENT_URL || "http://localhost:3000"
);
const ADMIN_URL = normalizeOrigin(
  process.env.ADMIN_URL || "http://localhost:3001"
);
const KITCHEN_URL = normalizeOrigin(
  process.env.KITCHEN_URL || "http://localhost:3002"
);

const allowedOrigins = [
  CLIENT_URL,
  ADMIN_URL,
  KITCHEN_URL,
  "https://www.hungrr.in",
];
console.log("✅ Allowed origins:", allowedOrigins);

// =============================================
// MIDDLEWARE
// =============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Main CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // SSR, Postman, etc.
      const cleaned = normalizeOrigin(origin);
      if (allowedOrigins.includes(cleaned)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS BLOCKED: ${cleaned}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Preflight handler for CORS
app.options(
  "*",
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleaned = normalizeOrigin(origin);
      if (allowedOrigins.includes(cleaned)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS BLOCKED (OPTIONS): ${cleaned}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

// =============================================
// SOCKET.IO SETUP
// =============================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on("join_cafe_room", (cafeId: string | number) => {
    if (!cafeId) return;
    socket.join(`cafe_${cafeId}`);
    console.log(`📦 ${socket.id} joined cafe_${cafeId}`);
  });

  socket.on("join_order_room", (orderId: string | number) => {
    if (!orderId) return;
    socket.join(`order_${orderId}`);
    console.log(`📦 ${socket.id} joined order_${orderId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Disconnected: ${socket.id} — Reason: ${reason}`);
  });
});

// =============================================
// ROUTES
// =============================================
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/kitchen", kitchenRoutes);

// =============================================
// CRON JOB
// =============================================
cron.schedule("* * * * *", async () => {
  console.log("⏰ Running cron job: cleaning up pending orders...");
  try {
    await cleanupPendingOrders();
    console.log("✅ Cleanup job done.");
  } catch (error) {
    console.error("❌ Error in cleanup job:", error);
  }
});

// =============================================
// EXPORT APP & SERVER
// =============================================
export { app, server };
