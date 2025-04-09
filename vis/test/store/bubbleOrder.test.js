import { expect, describe, it } from 'vitest';

import { hoverBubble, initializeStore, zoomIn, zoomOut } from "../../js/actions";

import reducer from "../../js/reducers/bubbleOrder";

describe("bubble order state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = { hoveredBubble: null, order: [] };

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the bubble order on bubble hover", () => {
      const INITIAL_STATE = { hoveredBubble: null, order: [] };

      const result = reducer(INITIAL_STATE, hoverBubble("some-uri"));

      const EXPECTED_RESULT = { hoveredBubble: "some-uri", order: ["some-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the hovered bubble on bubble unhover", () => {
      const INITIAL_STATE = { hoveredBubble: "some-uri", order: ["some-uri"] };

      const result = reducer(INITIAL_STATE, hoverBubble(null));

      const EXPECTED_RESULT = { hoveredBubble: null, order: ["some-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the bubble order on bubble zoom in", () => {
      const INITIAL_STATE = { hoveredBubble: null, order: ["some-uri"] };

      const result = reducer(INITIAL_STATE, zoomIn({uri: "some-other-uri"}));

      const EXPECTED_RESULT = { hoveredBubble: "some-other-uri", order: ["some-uri", "some-other-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the hovered bubble on bubble zoom out", () => {
      const INITIAL_STATE = { hoveredBubble: "some-uri", order: ["some-uri"] };

      const result = reducer(INITIAL_STATE, zoomOut());

      const EXPECTED_RESULT = { hoveredBubble: null, order: ["some-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should change the hovered bubble on initialize", () => {
      const INITIAL_STATE = { hoveredBubble: "some-uri", order: ["some-uri"] };

      const result = reducer(INITIAL_STATE, initializeStore({}, {}, [], 1));

      const EXPECTED_RESULT = { hoveredBubble: null, order: ["some-uri"] };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should not change the state if the action is canceled", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { canceled: true });

      expect(result).toEqual(INITIAL_STATE);
    });

    it("should not change the state if the action is streamgraph", () => {
      const INITIAL_STATE = { some_state: 1 };

      const result = reducer(INITIAL_STATE, { isStreamgraph: true });

      expect(result).toEqual(INITIAL_STATE);
    });
  });
});
