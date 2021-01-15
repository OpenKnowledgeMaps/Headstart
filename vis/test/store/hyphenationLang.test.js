import { initializeStore } from "../../js/actions";

import reducer from "../../js/reducers/hyphenationLang";

describe("hyphenation language state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = null;

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should highlight the bubble", () => {
      const INITIAL_STATE = null;

      const result = reducer(
        INITIAL_STATE,
        initializeStore({hyphenation_language: "en"}, {}, [], 1)
      );

      const EXPECTED_RESULT = "en";

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
