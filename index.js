// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var UserRole = {
  ADMIN: "admin",
  SEMI_ADMIN: "semi_admin",
  USER: "user"
};
var UserStatus = {
  ACTIVE: "active",
  DISABLED: "disabled"
};
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type().notNull().default(UserRole.USER),
  status: text("status").$type().notNull().default(UserStatus.ACTIVE)
});
var insertUserSchema = createInsertSchema(users);
var departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  // Icon name for the department
  color: text("color").notNull()
  // Color code for the department
});
var insertDepartmentSchema = createInsertSchema(departments);
var resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  departmentId: integer("department_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertResourceSchema = createInsertSchema(resources).omit({ createdAt: true });
var pdfs = pgTable("pdfs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  // New field for PDF name
  description: text("description").default(""),
  // New field for PDF description
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  size: integer("size").notNull(),
  // size in bytes
  departmentId: integer("department_id").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var insertPdfSchema = createInsertSchema(pdfs).omit({ uploadedAt: true });

// server/storage.ts
var MemStorage = class {
  users;
  departments;
  resources;
  pdfs;
  userId;
  departmentId;
  resourceId;
  pdfId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.departments = /* @__PURE__ */ new Map();
    this.resources = /* @__PURE__ */ new Map();
    this.pdfs = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.departmentId = 1;
    this.resourceId = 1;
    this.pdfId = 1;
    this.initializeDefaultData();
  }
  // Initialize default users and departments
  initializeDefaultData() {
    this.createUser({
      username: "TudorCh",
      password: "Examen",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    });
    this.createUser({
      username: "IrinaR",
      password: "Examen",
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    });
    this.createUser({
      username: "AdeliU",
      password: "Examen",
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    });
    this.createUser({
      username: "Examen2025",
      password: "Examen",
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    });
    const departments3 = [
      { name: "Cardiologie", slug: "cardiologie", icon: "Heart", color: "#ef4444" },
      { name: "Chirurgie pediatric\u0103", slug: "chirurgie-pediatrica", icon: "Baby", color: "#f97316" },
      { name: "Chirurgie general\u0103 semiologie (nr.3)", slug: "chirurgie-generala-semiologie", icon: "Syringe", color: "#f59e0b" },
      { name: "Chirurgie nr.1", slug: "chirurgie-1", icon: "Scissors", color: "#84cc16" },
      { name: "Chirurgie nr.2", slug: "chirurgie-2", icon: "Scalpel", color: "#10b981" },
      { name: "Gastroenterologie", slug: "gastroenterologie", icon: "Stomach", color: "#06b6d4" },
      { name: "Nefrologie", slug: "nefrologie", icon: "Kidney", color: "#3b82f6" },
      { name: "Obstetric\u0103 \u0219i ginecologie", slug: "obstetrica-ginecologie", icon: "Stethoscope", color: "#8b5cf6" },
      { name: "Pediatrie", slug: "pediatrie", icon: "BabyBottle", color: "#d946ef" },
      { name: "Pneumologie", slug: "pneumologie", icon: "Lungs", color: "#ec4899" },
      { name: "Reumatologie", slug: "reumatologie", icon: "Bone", color: "#f43f5e" },
      { name: "Toate testele", slug: "toate-testele", icon: "FileText", color: "#64748b" }
    ];
    departments3.forEach((dept) => {
      this.createDepartment(dept);
    });
    const cardiologyDept = this.getDepartmentBySlug("cardiologie");
    if (cardiologyDept) {
      const resources3 = [
        { title: "Cardiologie 1-50", url: "https://example.com/cardiologie/1-50", departmentId: cardiologyDept.id, createdById: 1 },
        { title: "Cardiologie 51-100", url: "https://example.com/cardiologie/51-100", departmentId: cardiologyDept.id, createdById: 1 },
        { title: "Cardiologie 101-150", url: "https://example.com/cardiologie/101-150", departmentId: cardiologyDept.id, createdById: 1 },
        { title: "Cardiologie 151-200", url: "https://example.com/cardiologie/151-200", departmentId: cardiologyDept.id, createdById: 1 }
      ];
      resources3.forEach((resource) => {
        this.createResource(resource);
      });
      const pdfs3 = [
        {
          name: "Ghid de practic\u0103 clinic\u0103 \xEEn cardiologie 2025",
          description: "Ghidul oficial pentru practica clinic\u0103 cu cele mai recente recomand\u0103ri",
          filename: "cardiologie_guide_2025.pdf",
          originalFilename: "Ghid de practic\u0103 clinic\u0103 \xEEn cardiologie 2025.pdf",
          size: 15e6,
          departmentId: cardiologyDept.id,
          uploadedById: 1
        },
        {
          name: "Algoritmi pentru interpretarea EKG",
          description: "Colec\u021Bie de algoritmi diagnostici pentru interpretarea electrocardiogramelor",
          filename: "ekg_algorithms.pdf",
          originalFilename: "Algoritmi pentru EKG interpretare.pdf",
          size: 8e6,
          departmentId: cardiologyDept.id,
          uploadedById: 1
        }
      ];
      pdfs3.forEach((pdf) => {
        this.createPdf(pdf);
      });
    }
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return void 0;
  }
  async createUser(userData) {
    const id = this.userId++;
    const user = { ...userData, id };
    this.users.set(id, user);
    return user;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async updateUser(id, userData) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async deleteUser(id) {
    return this.users.delete(id);
  }
  // Department methods
  async getDepartment(id) {
    return this.departments.get(id);
  }
  async getDepartmentBySlug(slug) {
    for (const dept of this.departments.values()) {
      if (dept.slug === slug) {
        return dept;
      }
    }
    return void 0;
  }
  async createDepartment(departmentData) {
    const id = this.departmentId++;
    const department = { ...departmentData, id };
    this.departments.set(id, department);
    return department;
  }
  async getAllDepartments() {
    return Array.from(this.departments.values());
  }
  async updateDepartment(id, departmentData) {
    const department = await this.getDepartment(id);
    if (!department) return void 0;
    const updatedDepartment = { ...department, ...departmentData };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }
  async deleteDepartment(id) {
    const resourcesToDelete = await this.getResourcesByDepartment(id);
    const pdfsToDelete = await this.getPdfsByDepartment(id);
    for (const resource of resourcesToDelete) {
      await this.deleteResource(resource.id);
    }
    for (const pdf of pdfsToDelete) {
      await this.deletePdf(pdf.id);
    }
    return this.departments.delete(id);
  }
  // Resource methods
  async getResource(id) {
    return this.resources.get(id);
  }
  async createResource(resourceData) {
    const id = this.resourceId++;
    const resource = {
      ...resourceData,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.resources.set(id, resource);
    return resource;
  }
  async getResourcesByDepartment(departmentId) {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.departmentId === departmentId
    );
  }
  async getAllResources() {
    return Array.from(this.resources.values());
  }
  async updateResource(id, resourceData) {
    const resource = await this.getResource(id);
    if (!resource) return void 0;
    const updatedResource = { ...resource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  async deleteResource(id) {
    return this.resources.delete(id);
  }
  // PDF methods
  async getPdf(id) {
    return this.pdfs.get(id);
  }
  async createPdf(pdfData) {
    const id = this.pdfId++;
    const pdf = {
      ...pdfData,
      name: pdfData.name || pdfData.originalFilename,
      // Use name if provided, otherwise use original filename
      description: pdfData.description || null,
      id,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.pdfs.set(id, pdf);
    return pdf;
  }
  async getPdfsByDepartment(departmentId) {
    return Array.from(this.pdfs.values()).filter(
      (pdf) => pdf.departmentId === departmentId
    );
  }
  async getAllPdfs() {
    return Array.from(this.pdfs.values());
  }
  async deletePdf(id) {
    return this.pdfs.delete(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
import express from "express";
import session from "express-session";
import { z } from "zod";
import fs from "fs";
import path from "path";
import crypto from "crypto";
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "examen-de-stat-2025-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const apiRouter = express.Router();
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const isAuthenticated = async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account disabled" });
    }
    req.user = user;
    next();
  };
  const isAdmin = (req, res, next) => {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };
  const isAdminOrSemiAdmin = (req, res, next) => {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SEMI_ADMIN) {
      return res.status(403).json({ message: "Admin or semi-admin access required" });
    }
    next();
  };
  const uploadMiddleware = (req, res, next) => {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return next();
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        const boundaryMatch = req.headers["content-type"]?.match(/boundary=(?:"([^"]+)"|([^;]+))/);
        if (!boundaryMatch) throw new Error("No boundary found");
        const boundary = boundaryMatch[1] || boundaryMatch[2];
        const parts = data.split(`--${boundary}`);
        const files = {};
        const fields = {};
        for (const part of parts) {
          if (!part.trim() || part.includes("--\r\n")) continue;
          const [headerStr, ...bodyParts] = part.split("\r\n\r\n");
          const bodyContent = bodyParts.join("\r\n\r\n");
          if (headerStr.includes("filename=")) {
            const filenameMatch = headerStr.match(/filename="([^"]+)"/);
            if (filenameMatch) {
              const originalFilename = filenameMatch[1];
              const extension = path.extname(originalFilename);
              const filename = `${crypto.randomBytes(16).toString("hex")}${extension}`;
              const filepath = path.join(uploadsDir, filename);
              const fileContent = bodyContent.substring(0, bodyContent.lastIndexOf("\r\n"));
              const buffer = Buffer.from(fileContent, "binary");
              fs.writeFileSync(filepath, buffer);
              files[originalFilename] = {
                filename,
                originalFilename,
                size: buffer.length,
                path: filepath
              };
            }
          } else {
            const nameMatch = headerStr.match(/name="([^"]+)"/);
            if (nameMatch) {
              const fieldName = nameMatch[1];
              fields[fieldName] = bodyContent.substring(0, bodyContent.lastIndexOf("\r\n"));
            }
          }
        }
        req.body = fields;
        req.files = files;
        next();
      } catch (err) {
        console.error("Error processing multipart form data:", err);
        res.status(400).json({ message: "Error processing form data" });
      }
    });
  };
  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      if (user.status !== "active") {
        return res.status(403).json({ message: "Account disabled" });
      }
      req.session.userId = user.id;
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });
  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  apiRouter.get("/auth/me", isAuthenticated, (req, res) => {
    const { id, username, role } = req.user;
    res.json({ id, username, role });
  });
  apiRouter.get("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users3 = await storage.getAllUsers();
      res.json(users3.map(({ password, ...rest }) => rest));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  apiRouter.post("/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const newUser = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  apiRouter.patch("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertUserSchema.partial();
      const userData = updateSchema.parse(req.body);
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (userData.username && userData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(userData.username);
        if (userWithSameUsername) {
          return res.status(409).json({ message: "Username already exists" });
        }
      }
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  apiRouter.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (id === req.session.userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  apiRouter.get("/departments", async (req, res) => {
    try {
      const departments3 = await storage.getAllDepartments();
      res.json(departments3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });
  apiRouter.get("/departments/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const department = await storage.getDepartmentBySlug(slug);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });
  apiRouter.post("/departments", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const departments3 = await storage.getAllDepartments();
      const nameExists = departments3.some((d) => d.name.toLowerCase() === departmentData.name.toLowerCase());
      const slugExists = departments3.some((d) => d.slug.toLowerCase() === departmentData.slug.toLowerCase());
      if (nameExists) {
        return res.status(409).json({ message: "Department name already exists" });
      }
      if (slugExists) {
        return res.status(409).json({ message: "Department slug already exists" });
      }
      const newDepartment = await storage.createDepartment(departmentData);
      res.status(201).json(newDepartment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid department data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });
  apiRouter.patch("/departments/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertDepartmentSchema.partial();
      const departmentData = updateSchema.parse(req.body);
      const existingDepartment = await storage.getDepartment(id);
      if (!existingDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }
      if (departmentData.name || departmentData.slug) {
        const departments3 = await storage.getAllDepartments();
        if (departmentData.name && departmentData.name !== existingDepartment.name) {
          const nameExists = departments3.some(
            (d) => d.id !== id && d.name.toLowerCase() === departmentData.name.toLowerCase()
          );
          if (nameExists) {
            return res.status(409).json({ message: "Department name already exists" });
          }
        }
        if (departmentData.slug && departmentData.slug !== existingDepartment.slug) {
          const slugExists = departments3.some(
            (d) => d.id !== id && d.slug.toLowerCase() === departmentData.slug.toLowerCase()
          );
          if (slugExists) {
            return res.status(409).json({ message: "Department slug already exists" });
          }
        }
      }
      const updatedDepartment = await storage.updateDepartment(id, departmentData);
      if (!updatedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(updatedDepartment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid department data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update department" });
    }
  });
  apiRouter.delete("/departments/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      const success = await storage.deleteDepartment(id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json({ message: "Department and all associated resources deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });
  apiRouter.get("/resources", async (req, res) => {
    try {
      let resources3;
      if (req.query.department) {
        const department = await storage.getDepartmentBySlug(req.query.department);
        if (!department) {
          return res.status(404).json({ message: "Department not found" });
        }
        resources3 = await storage.getResourcesByDepartment(department.id);
      } else {
        resources3 = await storage.getAllResources();
      }
      res.json(resources3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });
  apiRouter.post("/resources", isAuthenticated, isAdminOrSemiAdmin, async (req, res) => {
    try {
      const resourceData = insertResourceSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      const department = await storage.getDepartment(resourceData.departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      const newResource = await storage.createResource(resourceData);
      res.status(201).json(newResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });
  apiRouter.patch("/resources/:id", isAuthenticated, isAdminOrSemiAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertResourceSchema.partial();
      const resourceData = updateSchema.parse(req.body);
      const existingResource = await storage.getResource(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      if (resourceData.departmentId && resourceData.departmentId !== existingResource.departmentId) {
        const department = await storage.getDepartment(resourceData.departmentId);
        if (!department) {
          return res.status(404).json({ message: "Department not found" });
        }
      }
      const updatedResource = await storage.updateResource(id, resourceData);
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(updatedResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource" });
    }
  });
  apiRouter.delete("/resources/:id", isAuthenticated, isAdminOrSemiAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      const success = await storage.deleteResource(id);
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });
  apiRouter.get("/pdfs", async (req, res) => {
    try {
      let pdfs3;
      if (req.query.department) {
        const department = await storage.getDepartmentBySlug(req.query.department);
        if (!department) {
          return res.status(404).json({ message: "Department not found" });
        }
        pdfs3 = await storage.getPdfsByDepartment(department.id);
      } else {
        pdfs3 = await storage.getAllPdfs();
      }
      res.json(pdfs3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PDFs" });
    }
  });
  apiRouter.post("/pdfs", isAuthenticated, isAdminOrSemiAdmin, uploadMiddleware, async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const file = Object.values(req.files)[0];
      const { departmentId, name, description } = req.body;
      if (!departmentId) {
        return res.status(400).json({ message: "Department ID is required" });
      }
      if (!name) {
        return res.status(400).json({ message: "Document name is required" });
      }
      const department = await storage.getDepartment(parseInt(departmentId));
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      const pdfData = {
        name,
        description: description || null,
        filename: file.filename,
        originalFilename: file.originalFilename,
        size: file.size,
        departmentId: parseInt(departmentId),
        uploadedById: req.user.id
      };
      const newPdf = await storage.createPdf(pdfData);
      res.status(201).json(newPdf);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload PDF" });
    }
  });
  apiRouter.get("/pdfs/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdf = await storage.getPdf(id);
      if (!pdf) {
        return res.status(404).json({ message: "PDF not found" });
      }
      const filePath = path.join(uploadsDir, pdf.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.download(filePath, pdf.originalFilename);
    } catch (error) {
      res.status(500).json({ message: "Failed to download PDF" });
    }
  });
  apiRouter.delete("/pdfs/:id", isAuthenticated, isAdminOrSemiAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdf = await storage.getPdf(id);
      if (!pdf) {
        return res.status(404).json({ message: "PDF not found" });
      }
      const filePath = path.join(uploadsDir, pdf.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const success = await storage.deletePdf(id);
      if (!success) {
        return res.status(404).json({ message: "PDF not found" });
      }
      res.json({ message: "PDF deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete PDF" });
    }
  });
  app2.use("/api", apiRouter);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
