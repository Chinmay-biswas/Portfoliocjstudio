import cors from "cors";
import { randomUUID } from "node:crypto";
import dns from "node:dns";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PortfolioContent from "./models/PortfolioContent.js";
import { getCodingProgress, refreshCodingProgress } from "./services/codingProgress.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const adminCode = process.env.ADMIN_CODE || "admin123";
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.join(serverDirectory, "uploads");
const mongoDnsServers = (process.env.MONGODB_DNS_SERVER || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);
let databaseReady = false;
let reconnectTimer = null;

mkdirSync(uploadsDirectory, { recursive: true });

if (mongoDnsServers.length > 0) {
  dns.setServers(mongoDnsServers);
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDirectory, { immutable: true, maxAge: "1y" }));

const uploadMimeTypes = {
  ".jpg": new Set(["image/jpeg"]),
  ".jpeg": new Set(["image/jpeg"]),
  ".png": new Set(["image/png"]),
  ".webp": new Set(["image/webp"]),
  ".gif": new Set(["image/gif"]),
  ".avif": new Set(["image/avif"]),
  ".heic": new Set(["image/heic", "image/heif"]),
  ".heif": new Set(["image/heic", "image/heif"]),
  ".pdf": new Set(["application/pdf"]),
};
const uploadKinds = new Set(["image", "pdf"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDirectory),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = uploadMimeTypes[extension];
    const requestedKind = _req.query.kind;
    const isPdf = file.mimetype === "application/pdf";

    if (!allowedMimeTypes || !allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Only JPG, PNG, WEBP, GIF, AVIF, HEIC, or PDF files are allowed"));
      return;
    }

    if ((requestedKind === "image" && isPdf) || (requestedKind === "pdf" && !isPdf)) {
      callback(new Error(requestedKind === "pdf" ? "Choose a PDF file" : "Choose an image file"));
      return;
    }

    callback(null, true);
  },
});

function requireAdmin(req, res, next) {
  if (req.headers["x-admin-code"] !== adminCode) {
    return res.status(401).json({ message: "Admin access required" });
  }

  next();
}

function requireDatabase(req, res, next) {
  if (!databaseReady) {
    return res.status(503).json({ message: "MongoDB is reconnecting. Please try again shortly." });
  }

  next();
}

async function getContentDocument() {
  return PortfolioContent.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { new: true, upsert: true }
  );
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, databaseReady });
});

app.post("/api/admin/verify", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/upload", requireAdmin, (req, res) => {
  if (!uploadKinds.has(req.query.kind)) {
    res.status(400).json({ message: "Choose whether this upload is an image or PDF" });
    return;
  }

  upload.single("file")(req, res, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "Files must be 12 MB or smaller"
        : error.message || "Could not upload file";
      res.status(400).json({ message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Choose an image or PDF to upload" });
      return;
    }

    res.status(201).json({
      url: `/uploads/${encodeURIComponent(req.file.filename)}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      kind: req.query.kind,
    });
  });
});

app.get("/api/portfolio", requireDatabase, async (req, res) => {
  try {
    const content = await getContentDocument();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Could not load portfolio content" });
  }
});

app.get("/api/coding-progress", requireDatabase, async (req, res) => {
  try {
    const content = await getContentDocument();
    const progress = await getCodingProgress(content);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Could not load coding progress" });
  }
});

app.post("/api/admin/coding-progress/refresh", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const content = await getContentDocument();
    const progress = await refreshCodingProgress(content);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Could not refresh coding progress" });
  }
});

app.put("/api/portfolio", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "roles",
      "about",
      "aboutShort",
      "aboutLong",
      "aboutExtra",
      "aboutFinal",
      "aboutStats",
      "achievements",
      "theme",
      "media",
      "navigation",
      "homeButtons",
      "homeSection",
      "introAnimation",
      "sectionSettings",
      "sectionOrder",
      "adminPageOrder",
      "aboutSection",
      "skillsSection",
      "skillsSpaceSection",
      "projectsSection",
      "journeySection",
      "codingProgressSection",
      "githubSection",
      "codeforcesSection",
      "leetcodeSection",
      "skills",
      "skillCards",
      "spaceSkills",
      "projects",
      "journeys",
      "testimonialsSection",
      "testimonials",
      "contactSection",
      "footer",
      "socials",
      "resumeLinks",
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    const content = await PortfolioContent.findOneAndUpdate(
      { key: "main" },
      { $set: { ...updates, initialized: true } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(content);
  } catch (error) {
    res.status(400).json({ message: "Could not save portfolio content" });
  }
});

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

function scheduleDatabaseReconnect() {
  if (reconnectTimer || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDatabase();
  }, 10_000);
}

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    databaseReady = true;
    return;
  }

  if (mongoose.connection.readyState === 2) return;

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    databaseReady = true;
    console.log("MongoDB connected");
  } catch (error) {
    databaseReady = false;
    console.error("MongoDB connection failed; retrying in 10 seconds", error.message);
    scheduleDatabaseReconnect();
  }
}

mongoose.connection.on("connected", () => {
  databaseReady = true;
});

mongoose.connection.on("disconnected", () => {
  databaseReady = false;
  scheduleDatabaseReconnect();
});

app.listen(port, () => {
  console.log(`Admin API running on http://127.0.0.1:${port}`);
  connectDatabase();
});
