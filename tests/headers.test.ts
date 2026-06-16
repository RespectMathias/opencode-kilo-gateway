import { afterEach, describe, expect, it, vi } from "vitest";
import { buildKiloHeaders } from "../src/headers";

describe("headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds default kilo headers", () => {
    expect(buildKiloHeaders()).toEqual({
      "X-KILOCODE-EDITORNAME": "OpenCode Kilo Gateway",
    });
  });

  it("includes optional environment and metadata headers", () => {
    vi.stubEnv("KILOCODE_EDITOR_NAME", "Test Editor");
    vi.stubEnv("KILOCODE_FEATURE", "test-feature");

    expect(
      buildKiloHeaders(
        {
          taskId: "task_123",
          projectId: "project_123",
          machineId: "machine_123",
        },
        { organizationId: "org_123" },
      ),
    ).toEqual({
      "X-KILOCODE-EDITORNAME": "Test Editor",
      "X-KILOCODE-FEATURE": "test-feature",
      "X-KILOCODE-TASKID": "task_123",
      "X-KILOCODE-PROJECTID": "project_123",
      "X-KILOCODE-MACHINEID": "machine_123",
      "X-KILOCODE-ORGANIZATIONID": "org_123",
    });
  });
});
