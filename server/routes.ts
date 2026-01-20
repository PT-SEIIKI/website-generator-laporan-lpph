import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  });

  app.post(api.reports.create.path, async (req, res) => {
    try {
      console.log(`[API] Creating report with data:`, JSON.stringify(req.body).substring(0, 200) + "...");
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(input);
      console.log(`[API] Report created successfully: ID ${report.id}`);
      res.status(201).json(report);
    } catch (err) {
      console.error(`[API] Error creating report:`, err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.reports.update.path, async (req, res) => {
    try {
      console.log(`[API] Updating report ${req.params.id}`);
      const input = api.reports.update.input.parse(req.body);
      const report = await storage.updateReport(Number(req.params.id), input);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (err) {
      console.error(`[API] Error updating report:`, err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.reports.delete.path, async (req, res) => {
    await storage.deleteReport(Number(req.params.id));
    res.status(204).send();
  });

  // Upload endpoint
  app.post(api.uploads.create.path, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return relative URL
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });

  return httpServer;
}
