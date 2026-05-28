import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub env vars before the module is imported so the top-level guard doesn't throw
vi.stubEnv("ZENDESK_EMAIL", "test@example.com");
vi.stubEnv("ZENDESK_TOKEN", "abc123");
vi.stubEnv("ZENDESK_SUBDOMAIN", "testdomain");

vi.mock("node-zendesk", () => ({
  default: {
    createClient: vi.fn().mockReturnValue({}),
  },
}));

describe("ZENDESK_CLIENT_HEADERS", () => {
  it("includes the X-Zendesk-Client header", async () => {
    const { ZENDESK_CLIENT_HEADERS } = await import("./index.js");
    expect(ZENDESK_CLIENT_HEADERS["X-Zendesk-Client"]).toBe("zd-mcp-server");
  });
});

describe("createZendeskClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("passes customHeaders to createClient", async () => {
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

  it("passes X-Zendesk-Client header value to createClient", async () => {
    const { createZendeskClient } = await import("./index.js");
    const zendesk = (await import("node-zendesk")).default;

    createZendeskClient({
      email: "test@example.com",
      token: "abc123",
      subdomain: "testdomain",
    });

    const callArg = vi.mocked(zendesk.createClient).mock.calls[0][0] as any;
    expect(callArg.customHeaders["X-Zendesk-Client"]).toBe("zd-mcp-server");
  });
});
