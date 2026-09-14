import { shallowMount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import EnterpriseGridState from "@/components/shared/EnterpriseGridState.vue";

describe("enterprise grid state", () => {
  it("renders an accessible reusable empty state", () => {
    const wrapper = shallowMount(EnterpriseGridState, {
      props: {
        title: "No rows available",
        description: "Create a record or adjust your filters.",
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    expect(wrapper.attributes("role")).toBe("status");
    expect(wrapper.attributes("aria-live")).toBe("polite");
    expect(wrapper.classes()).toContain("enterprise-grid-state--empty");
    expect(wrapper.text()).toContain("No rows available");
    expect(wrapper.text()).toContain("Create a record or adjust your filters.");
  });

  it("uses semantic classes for error states", () => {
    const wrapper = shallowMount(EnterpriseGridState, {
      props: {
        title: "Grid unavailable",
        description: "Retry later.",
        variant: "error",
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: "<i />" },
        },
      },
    });

    expect(wrapper.classes()).toContain("enterprise-grid-state--error");
  });

  it("uses theme tokens so empty states remain readable in light mode", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/shared/EnterpriseGridState.vue"),
      "utf8",
    );

    expect(source).toContain("var(--id-color-text)");
    expect(source).toContain("var(--id-color-text-muted)");
    expect(source).toContain("var(--id-color-border-strong)");
    expect(source).not.toContain("rgba(255, 255, 255");
    expect(source).not.toContain("color: #f6f7fb");
  });
});
