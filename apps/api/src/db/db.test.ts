import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDevDb, schema } from "./index";

describe("in-process Postgres (PGlite) with Drizzle", () => {
  let ctx: Awaited<ReturnType<typeof createDevDb>>;
  beforeAll(async () => { ctx = await createDevDb(); });
  afterAll(async () => { await ctx.client.close(); });

  it("stores and reads a project and a task with jsonb plan data", async () => {
    const { db } = ctx;
    await db.insert(schema.projects).values({ id: "p1", name: "term project" });
    await db.insert(schema.tasks).values({ id: "t1", projectId: "p1", title: "lit worksheet", plan: { deadline: "2026-11-27", inPlan: true } });
    const rows = await db.select().from(schema.tasks).where(eq(schema.tasks.projectId, "p1"));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.plan).toEqual({ deadline: "2026-11-27", inPlan: true });
  });
  it("enforces the project foreign key like real Postgres", async () => {
    const { db } = ctx;
    await expect(db.insert(schema.tasks).values({ id: "t2", projectId: "missing", title: "x" })).rejects.toThrow();
  });
});
