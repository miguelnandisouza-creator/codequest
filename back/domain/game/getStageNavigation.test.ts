import { describe, expect, it } from "vitest";

import { getStageNavigation } from "@/domain/game/getStageNavigation";

describe("getStageNavigation", () => {
  it("moves from the last stage of a module to the first stage of the next module", () => {
    expect(
      getStageNavigation("sql-village-10-boss")?.nextStageId
    ).toBe("sql-city-01-filter-why");
  });

  it("returns no next stage for the final campaign boss", () => {
    expect(
      getStageNavigation("sql-relations-07-final-boss")?.nextStageId
    ).toBeUndefined();
  });
});
