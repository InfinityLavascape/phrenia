import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Spike schema only. Step 1 replaces this with the real model and migrations.
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  plan: jsonb("plan").$type<Record<string, unknown>>().notNull().default({}),
});
