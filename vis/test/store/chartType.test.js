import { describe, expect, it } from "vitest";

import { initializeStore } from "../../js/actions";
import {
  chartType,
  KNOWLEDGEMAP_MODE,
  STREAMGRAPH_MODE,
} from "../../js/reducers/chartType";

describe("chartType state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = KNOWLEDGEMAP_MODE;

      const result = chartType(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should initialize the knowledgemap", () => {
      const initialState = KNOWLEDGEMAP_MODE;
      const expectedResult = KNOWLEDGEMAP_MODE;

      const result = chartType(
        initialState,
        initializeStore({ is_streamgraph: false }),
      );

      expect(result).toEqual(expectedResult);
    });

    it("should initialize the streamgraph", () => {
      const initialState = KNOWLEDGEMAP_MODE;
      const expectedResult = STREAMGRAPH_MODE;

      const result = chartType(
        initialState,
        initializeStore({ visualization_type: STREAMGRAPH_MODE }),
      );

      expect(result).toEqual(expectedResult);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = chartType(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
