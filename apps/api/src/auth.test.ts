import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDevDb } from "./db/index";

describe("Better Auth smoke test", () => {
  let ctx: Awaited<ReturnType<typeof createDevDb>>;
  beforeAll(async () => { ctx = await createDevDb(); });
  afterAll(async () => { await ctx.client.close(); });

  it("constructs with the Drizzle adapter and Google sign-in configured", async () => {
    const { db } = ctx;
    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg" }),
      secret: "test-secret-test-secret-test-secret-123",
      baseURL: "http://localhost:8787",
      socialProviders: { google: { clientId: "test-client-id", clientSecret: "test-client-secret" } },
    });
    expect(typeof auth.handler).toBe("function");
  });
});
