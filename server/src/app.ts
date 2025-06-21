// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import cafeRoutes from "./routes/cafeRoutes"; // ✅ ROUTER not a controller!

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", cafeRoutes); // ✅ Fixed API for Users

export default app;
