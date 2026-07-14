import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PixelScene from "@/components/adventure/PixelScene";
import { zeroToBasicsStages } from "@/data/campaigns/sql/stages/curriculum";

describe("PixelScene", () => {
  it("renders stage-specific scene text before and after solving", () => {
    const tableStage = zeroToBasicsStages[1];

    const { rerender } = render(
      <PixelScene
        stage={tableStage}
        resolved={false}
      />
    );

    expect(
      screen.getByText("O mural da vila mostra registros soltos esperando organizacao.")
    ).toBeDefined();

    rerender(
      <PixelScene
        stage={tableStage}
        resolved
      />
    );

    expect(
      screen.getByText("O mural revelou a tabela clientes com linhas e colunas.")
    ).toBeDefined();
  });
});
