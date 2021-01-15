import { highlightArea } from "../../js/actions";

import reducer from "../../js/reducers/highlightedBubble";

describe("highlighted bubble state", () => {
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
        highlightArea({ area_uri: "some-uri" })
      );

      const EXPECTED_RESULT = "some-uri";

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
