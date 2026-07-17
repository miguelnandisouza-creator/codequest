import { describe, expect, it } from "vitest";

import { javaCampaign } from "./campaign";

describe("javaCampaign", () => {
  it("ships a complete Java path with 10 modules and 100 stages", () => {
    expect(javaCampaign.chapters).toHaveLength(10);
    expect(javaCampaign.chapters.flatMap((chapter) => chapter.stages)).toHaveLength(100);

    for (const chapter of javaCampaign.chapters) {
      expect(chapter.stages).toHaveLength(10);
    }
  });

  it("keeps every Java stage instructional before asking for an answer", () => {
    for (const stage of javaCampaign.chapters.flatMap((chapter) => chapter.stages)) {
      expect(stage.language).toBe("java");
      expect(stage.content[0]?.type).toBe("text");
      expect(stage.content[1]?.type).toBe("example");
      expect(stage.content.length).toBeGreaterThanOrEqual(3);
    }
  });
});
