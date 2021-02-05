import { stopAnimation, zoomIn, zoomOut } from "../../js/actions";

import reducer from "../../js/reducers/animation";

describe("animation state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_RESULT = null;

      const result = reducer(undefined, {});

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should return the zoom in animation", () => {
      const INITIAL_STATE = null;
      const F = jest.fn();

      const result = reducer(INITIAL_STATE, zoomIn({}, undefined, F, false));

      const EXPECTED_RESULT = {
        type: "ZOOM_IN",
        alreadyZoomed: false,
        transition: result.transition,
      };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should return the zoom out animation", () => {
      const INITIAL_STATE = null;
      const F = jest.fn();

      const result = reducer(INITIAL_STATE, zoomOut(F));

      const EXPECTED_RESULT = {
        type: "ZOOM_OUT",
        transition: result.transition,
      };

      expect(result).toEqual(EXPECTED_RESULT);
    });

    it("should stop the animation", () => {
      const INITIAL_STATE = null;

      const result = reducer(INITIAL_STATE, stopAnimation());

      const EXPECTED_RESULT = null;

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
