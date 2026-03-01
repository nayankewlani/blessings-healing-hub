const pg = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { pgTable, text, serial, integer, timestamp } = require('drizzle-orm/pg-core');
const { createInsertSchema } = require('drizzle-zod');
const { z } = require('zod');
const express = require('express');
const { createServer } = require('http');
const path = require('path');
// --- SCHEMA ---
const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  duration: text("duration"),
  price: text("price"),
  createdAt: timestamp("created_at").defaultNow(),
});
const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});
const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  yearsInOperation: integer("years_in_operation").notNull(),
  practitionersTrained: integer("practitioners_trained").notNull(),
  livesTouched: integer("lives_touched").notNull(),
});
// --- DATABASE ---
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { courses, leads, stats } });
// --- STORAGE ---
const storage = {
  async getCourses() { return await db.select().from(courses); },
  async createCourse(course) { return (await db.insert(courses).values(course).returning())[0]; },
  async getLeads() { return await db.select().from(leads); },
  async createLead(lead) { return (await db.insert(leads).values(lead).returning())[0]; },
  async updateLeadStatus(id, status) {
    return (await db.update(leads).set({ status }).where(eq(leads.id, id)).returning())[0];
  },
  async getStats() { return (await db.select().from(stats))[0]; },
  async updateStats(val) {
    const s = await this.getStats();
    if (!s) return (await db.insert(stats).values(val).returning())[0];
    return (await db.update(stats).set(val).where(eq(stats.id, s.id)).returning())[0];
  }
};
const { eq } = require('drizzle-orm');
// --- SERVER ---
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/api/courses', async (req, res) => res.json(await storage.getCourses()));
app.post('/api/courses', async (req, res) => res.json(await storage.createCourse(req.body)));
app.get('/api/leads', async (req, res) => res.json(await storage.getLeads()));
app.post('/api/leads', async (req, res) => res.json(await storage.createLead(req.body)));
app.get('/api/stats', async (req, res) => res.json(await storage.getStats()));
app.put('/api/stats', async (req, res) => res.json(await storage.updateStats(req.body)));
const server = createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));