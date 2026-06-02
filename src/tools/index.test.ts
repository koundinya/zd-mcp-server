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

  it("sets a User-Agent identifying the MCP server", async () => {
    const { ZENDESK_CLIENT_HEADERS } = await import("./index.js");
    expect(ZENDESK_CLIENT_HEADERS["User-Agent"]).toMatch(/^zd-mcp-server\//);
  });
});

describe("createZendeskClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("passes the User-Agent custom header to createClient", async () => {
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

  it("is initialised with the User-Agent custom header", async () => {
    // Get a reference to the mock BEFORE importing index.js so we capture
    // the createClient call that fires at module load time, then clear any
    // prior calls so only the env-client instantiation is counted.
    const zendesk = (await import("node-zendesk")).default;
    vi.mocked(zendesk.createClient).mockClear();

    // Importing index.js triggers the module-level createClient call
    const { ZENDESK_CLIENT_HEADERS } = await import("./index.js");

    // Should have been called exactly once for the env-based client
    expect(vi.mocked(zendesk.createClient)).toHaveBeenCalledOnce();
    const callArg = vi.mocked(zendesk.createClient).mock.calls[0][0] as any;
    expect(callArg.customHeaders).toEqual(ZENDESK_CLIENT_HEADERS);
  });
});
