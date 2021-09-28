import { zoomIn, zoomOut } from "../../js/actions";

import zoomReducer from "../../js/reducers/zoom";
import selectedBubbleReducer from "../../js/reducers/selectedBubble";

describe("zoom state", () => {
  describe("actions", () => {
    it("should create a default zoom-in action", () => {
      const DATA = {
        title: "some title",
        url: "http://example.com",
      };

      const EXPECTED_ACTION = {
        type: "ZOOM_IN",
        selectedAreaData: DATA,
        alreadyZoomed: false,
        callback: undefined,
        noHistory: false,
      };
      expect(zoomIn(DATA)).toEqual(EXPECTED_ACTION);
    });

    it("should create a zoom-out action", () => {
      const EXPECTED_ACTION = {
        type: "ZOOM_OUT",
        callback: undefined,
      };
      expect(zoomOut()).toEqual(EXPECTED_ACTION);
    });
  });

  describe("reducers", () => {
    describe("zoom reducer", () => {
      it("should return the initial state", () => {
        const EXPECTED_RESULT = false;

        const result = zoomReducer(undefined, {});

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the internal zoom out", () => {
        const initialState = true;
        const EXPECTED_RESULT = false;

        const result = zoomReducer(initialState, zoomOut());

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should not change the state if the action is canceled", () => {
        const INITIAL_STATE = { some_state: 1 };

        const result = zoomReducer(INITIAL_STATE, { canceled: true });

        expect(result).toEqual(INITIAL_STATE);
      });
    });

    describe("selectedBubble reducer", () => {
      it("should return the initial state", () => {
        const EXPECTED_RESULT = null;

        const result = selectedBubbleReducer(undefined, {});

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the internal zoom out", () => {
        const initialState = { someValue: "sample text" };
        const EXPECTED_RESULT = null;

        const result = selectedBubbleReducer(initialState, zoomOut());

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should not change the state if the action is canceled", () => {
        const INITIAL_STATE = { some_state: 1 };

        const result = selectedBubbleReducer(INITIAL_STATE, { canceled: true });

        expect(result).toEqual(INITIAL_STATE);
      });
    });
  });
});
