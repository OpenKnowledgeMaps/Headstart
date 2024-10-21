import { expect, describe, it } from 'vitest';

import {
  getLabelPosition,
  recalculateOverlappingLabels,
} from "../../js/utils/streamgraph";

describe("Streamgraph utility functions", () => {
  it("returns a label position (getLabelPosition)", () => {
    const LABEL = {
      getBBox: () => ({ width: 60, height: 20 }),
    };
    const AREA = {
      key: "sample-stream",
      values: [
        { y: 5, y0: 4, date: 2021 },
        { y: 10, y0: 8, date: 2022 },
      ],
    };
    const EXPECTED_RESULT = {
      center_x: 356.5,
      height: 32,
      key: "sample-stream",
      width: 87,
      x: 313,
      y: 3,
    };

    const actualResult = getLabelPosition(
      LABEL,
      AREA,
      (x) => x,
      (y) => y,
      400
    );

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it("moves overlapping labels (recalculateOverlappingLabels)", () => {
    const LABELS = [
      {
        center_x: 30,
        height: 20,
        key: "stream1",
        width: 60,
        x: 0,
        y: 10,
      },
      {
        center_x: 30,
        height: 20,
        key: "stream2",
        width: 50,
        x: 0,
        y: 15,
      },
      {
        center_x: 40,
        height: 20,
        key: "stream3",
        width: 60,
        x: 10,
        y: 10,
      },
      {
        center_x: 100,
        height: 20,
        key: "stream4",
        width: 60,
        x: 70,
        y: 10,
      },
      {
        center_x: 250,
        height: 20,
        key: "stream5",
        width: 60,
        x: 220,
        y: 10,
      },
    ];
    const EXPECTED_RESULT = [
      {
        center_x: 30,
        height: 20,
        key: "stream1",
        width: 60,
        x: 0,
        y: 20,
      },
      {
        center_x: 30,
        height: 20,
        key: "stream2",
        width: 50,
        x: 0,
        y: 30,
      },
      {
        center_x: 40,
        height: 20,
        key: "stream3",
        width: 60,
        x: 10,
        y: 0,
      },
      {
        center_x: 100,
        height: 20,
        key: "stream4",
        width: 60,
        x: 70,
        y: 20,
      },
      {
        center_x: 250,
        height: 20,
        key: "stream5",
        width: 60,
        x: 220,
        y: 10,
      },
    ].map((label) => ({ ...label, repositioned: true }));

    const actualResult = recalculateOverlappingLabels(LABELS);

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });
});
