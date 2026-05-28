import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node-zendesk", () => ({
  default: {
    createClient: vi.fn().mockReturnValue({}),
  },
}));

// Stub env vars so the module-level guard and env-based client don't throw
vi.stubEnv("ZENDESK_EMAIL", "test@example.com");
vi.stubEnv("ZENDESK_TOKEN", "abc123");
vi.stubEnv("ZENDESK_SUBDOMAIN", "testdomain");

describe("ZENDESK_CLIENT_HEADERS", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("includes the X-ZD-MCP-Server header", async () => {
    const { ZENDESK_CLIENT_HEADERS } = await import("./index.js");
    expect(ZENDESK_CLIENT_HEADERS["X-ZD-MCP-Server"]).toBe("zd-mcp-server");
  });
});

describe("createZendeskClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("passes X-ZD-MCP-Server custom header to createClient", async () => {
    const { createZendeskClient, ZENDESK_CLIENT_HEADERS } = await import("./index.js");
    const zendesk = (await import("node-zendesk")).default;

    createZendeskClient({
      email: "test@example.com",
      token: "abc123",
      subdomain: "testdomain",
    });

    const callArg = vi.mocked(zendesk.createClient).mock.calls[0][0] as any;
    expect(callArg.customHeaders).toEqual(ZENDESK_CLIENT_HEADERS);
  });
});

describe("env-based client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("is initialised with the X-ZD-MCP-Server custom header", async () => {
    // Importing the module triggers the env-based createClient call at the top level
    await import("./index.js");
    const zendesk = (await import("node-zendesk")).default;

    const { ZENDESK_CLIENT_HEADERS } = await import("./index.js");

    const envClientCall = vi.mocked(zendesk.createClient).mock.calls[0][0] as any;
    expect(envClientCall.customHeaders).toEqual(ZENDESK_CLIENT_HEADERS);
  });
});
