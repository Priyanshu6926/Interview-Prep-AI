import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import mockRoomRoutes from "./routes/mockRoomRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDistPath = path.resolve(__dirname, "../../dist");
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const staticDir = fs.existsSync(rootDistPath) ? rootDistPath : clientDistPath;

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/mock-rooms", mockRoomRoutes);

// Serve static frontend assets if built
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
