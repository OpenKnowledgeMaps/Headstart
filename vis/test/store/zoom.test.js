import {
  zoomInFromMediator,
  zoomOutFromMediator,
  zoomOut,
} from "../../js/actions";

import zoomReducer from "../../js/reducers/zoom";
import selectedBubbleReducer from "../../js/reducers/selectedBubble";

describe("zoom state", () => {
  describe("actions", () => {
    it("should create a zoom-in action", () => {
      const expectedAction = {
        type: "ZOOM_IN",
      };
      expect(zoomInFromMediator()).toEqual(expectedAction);
    });

    it("should create a zoom-out action", () => {
      const expectedAction = {
        type: "ZOOM_OUT",
      };
      expect(zoomOutFromMediator()).toEqual(expectedAction);
    });

    it("should create a zoom-out action with a flag", () => {
      const expectedAction = {
        type: "ZOOM_OUT",
        not_from_mediator: true,
      };
      expect(zoomOut()).toEqual(expectedAction);
    });
  });

  describe("reducers", () => {
    describe("zoom reducer", () => {
      it("should return the initial state", () => {
        const expectedResult = false;

        const result = zoomReducer(undefined, {});

        expect(result).toEqual(expectedResult);
      });

      it("should handle the zoom in", () => {
        const initialState = false;
        const expectedResult = true;

        const result = zoomReducer(initialState, zoomInFromMediator());

        expect(result).toEqual(expectedResult);
      });

      it("should handle the zoom out", () => {
        const initialState = true;
        const expectedResult = false;

        const result = zoomReducer(initialState, zoomOutFromMediator());

        expect(result).toEqual(expectedResult);
      });

      it("should handle the internal zoom out", () => {
        const initialState = true;
        const expectedResult = false;

        const result = zoomReducer(initialState, zoomOut());

        expect(result).toEqual(expectedResult);
      });
    });

    describe("selectedBubble reducer", () => {
      it("should return the initial state", () => {
        const expectedResult = null;

        const result = selectedBubbleReducer(undefined, {});

        expect(result).toEqual(expectedResult);
      });

      it("should handle the zoom in", () => {
        const initialState = null;
        const expectedResult = {title: "new title"};

        const result = selectedBubbleReducer(initialState, zoomInFromMediator(expectedResult));

        expect(result).toEqual(expectedResult);
      });

      it("should handle the zoom out", () => {
        const initialState = {someValue: "sample text"};
        const expectedResult = null;

        const result = selectedBubbleReducer(initialState, zoomOutFromMediator());

        expect(result).toEqual(expectedResult);
      });

      it("should handle the internal zoom out", () => {
        const initialState = {someValue: "sample text"};
        const expectedResult = null;

        const result = selectedBubbleReducer(initialState, zoomOut());

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
