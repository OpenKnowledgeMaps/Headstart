import {
  zoomIn,
  zoomInFromMediator,
  zoomOutFromMediator,
  zoomOut,
} from "../../js/actions";

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
        not_from_mediator: true,
        source: null,
        selectedAreaData: DATA,
        alreadyZoomed: false,
        callback: undefined,
      };
      expect(zoomIn(DATA)).toEqual(EXPECTED_ACTION);
    });

    it("should create a zoom-in action with source", () => {
      const DATA = {
        title: "some title",
        url: "http://example.com",
      };

      const SOURCE = "some-source";

      const EXPECTED_ACTION = {
        type: "ZOOM_IN",
        not_from_mediator: true,
        source: SOURCE,
        selectedAreaData: DATA,
        alreadyZoomed: false,
        callback: undefined,
      };
      expect(zoomIn(DATA, SOURCE)).toEqual(EXPECTED_ACTION);
    });

    it("should create a mediator zoom-in action", () => {
      const EXPECTED_ACTION = {
        type: "ZOOM_IN",
      };
      expect(zoomInFromMediator()).toEqual(EXPECTED_ACTION);
    });

    it("should create a zoom-out action", () => {
      const EXPECTED_ACTION = {
        type: "ZOOM_OUT",
      };
      expect(zoomOutFromMediator()).toEqual(EXPECTED_ACTION);
    });

    it("should create a zoom-out action with a flag", () => {
      const EXPECTED_ACTION = {
        type: "ZOOM_OUT",
        not_from_mediator: true,
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

      it("should handle the zoom in", () => {
        const initialState = false;
        const EXPECTED_RESULT = true;

        const result = zoomReducer(initialState, zoomInFromMediator());

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the zoom out", () => {
        const initialState = true;
        const EXPECTED_RESULT = false;

        const result = zoomReducer(initialState, zoomOutFromMediator());

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the internal zoom out", () => {
        const initialState = true;
        const EXPECTED_RESULT = false;

        const result = zoomReducer(initialState, zoomOut());

        expect(result).toEqual(EXPECTED_RESULT);
      });
    });

    describe("selectedBubble reducer", () => {
      it("should return the initial state", () => {
        const EXPECTED_RESULT = null;

        const result = selectedBubbleReducer(undefined, {});

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the zoom in", () => {
        const initialState = null;
        const EXPECTED_RESULT = { title: "new title" };

        const result = selectedBubbleReducer(
          initialState,
          zoomInFromMediator(EXPECTED_RESULT)
        );

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the zoom out", () => {
        const initialState = { someValue: "sample text" };
        const EXPECTED_RESULT = null;

        const result = selectedBubbleReducer(
          initialState,
          zoomOutFromMediator()
        );

        expect(result).toEqual(EXPECTED_RESULT);
      });

      it("should handle the internal zoom out", () => {
        const initialState = { someValue: "sample text" };
        const EXPECTED_RESULT = null;

        const result = selectedBubbleReducer(initialState, zoomOut());

        expect(result).toEqual(EXPECTED_RESULT);
      });
    });
  });
});
