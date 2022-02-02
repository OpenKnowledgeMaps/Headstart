import { initializeStore, updateDimensions } from "../../js/actions";

import reducer from "../../js/reducers/chart";

describe("chart state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = {
        width: null,
        height: null,
        streamWidth: null,
        streamHeight: null,
      };

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the dimensions on initialize", () => {
      const INITIAL_STATE = {
        width: null,
        height: null,
        streamWidth: null,
        streamHeight: null,
      };

      const result = reducer(
        INITIAL_STATE,
        initializeStore({}, {}, [], [], "", 200, 400, 200, 200, {})
      );

      const EXPECTED_RESULT = {
        width: 200,
        height: 200,
        streamWidth: 400,
        streamHeight: 200,
      };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the dimensions when updated", () => {
      const INITIAL_STATE = { width: 800, height: 800 };

      const result = reducer(
        INITIAL_STATE,
        updateDimensions({ size: 300 }, {})
      );

      const EXPECTED_RESULT = { width: 300, height: 300 };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the dimensions when updated (width > height)", () => {
      const INITIAL_STATE = { width: 800, height: 800 };

      const result = reducer(
        INITIAL_STATE,
        updateDimensions({ size: 300, width: 400, height: 300 }, {})
      );

      const EXPECTED_RESULT = {
        width: 300,
        height: 300,
        streamWidth: 400,
        streamHeight: 300,
      };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
