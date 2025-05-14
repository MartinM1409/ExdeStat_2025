import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const UserRole = {
  ADMIN: "admin",
  SEMI_ADMIN: "semi_admin",
  USER: "user",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Define status options
export const UserStatus = {
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<UserRoleType>().notNull().default(UserRole.USER),
  status: text("status").$type<UserStatusType>().notNull().default(UserStatus.ACTIVE),
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // Icon name for the department
  color: text("color").notNull(), // Color code for the department
});

export const insertDepartmentSchema = createInsertSchema(departments);
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

// Resources table (links)
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  departmentId: integer("department_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({ createdAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// PDF resources table
export const pdfs = pgTable("pdfs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""), // New field for PDF name
  description: text("description").default(""), // New field for PDF description
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  size: integer("size").notNull(), // size in bytes
  departmentId: integer("department_id").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertPdfSchema = createInsertSchema(pdfs).omit({ uploadedAt: true });
export type InsertPdf = z.infer<typeof insertPdfSchema>;
export type Pdf = typeof pdfs.$inferSelect;
