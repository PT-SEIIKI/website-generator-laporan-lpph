import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("VISUAL TEST ITEM – UJI LAIK OPERASI"),
  documentNumber: text("document_number").notNull(),
  layoutJson: jsonb("layout_json").notNull(),
  headerLogoUrl: text("header_logo_url"),
  headerTitle: text("header_title"),
  headerRevision: text("header_revision"),
  headerIssuedDate: text("header_issued_date"),
  headerRevisionDate: text("header_revision_date"),
  footerSignatureUrl: text("footer_signature_url"),
  officerName: text("officer_name"),
  technicianName: text("technician_name"),
  technicianSignatureUrl: text("technician_signature_url"),
  ownerName: text("owner_name"),
  ownerSignatureUrl: text("owner_signature_url"),
  operationYear: text("operation_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Helper types for the JSON structure (application level type safety)
export type CellType = "image" | "spacer";

export type ReportCell = {
  id: string;
  type: CellType;
  imageUrl?: string;
  caption?: string;
};

export type GridSection = {
  id: string;
  numCols: number;
  colWidths: string[];
  cells: ReportCell[];
};

export type TableRow = {
  id: string;
  cells: string[];
};

export type TableSection = {
  id: string;
  type: "table";
  title?: string;
  evaluationLabel?: string;
  description?: string;
  numCols: number;
  colLabels?: string[];
  colWidths: string[];
  rows: TableRow[];
};

export type ReportGridSection = {
  id: string;
  type: "grid";
  numCols: number;
  colWidths: string[];
  cells: ReportCell[];
};

export type ReportLayout = {
  sections: (TableSection | ReportGridSection)[];
};
