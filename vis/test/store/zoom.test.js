import {
  zoomInFromMediator,
  zoomOutFromMediator,
  zoomOut,
} from "../../js/actions";

import reducer from "../../js/reducers/zoom";

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
    it("should return the initial state", () => {
      const expectedResult = false;

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the zoom in", () => {
      const initialState = false;
      const expectedResult = true;

      const result = reducer(initialState, zoomInFromMediator());

      expect(result).toEqual(expectedResult);
    });

    it("should handle the zoom out", () => {
      const initialState = true;
      const expectedResult = false;

      const result = reducer(initialState, zoomOutFromMediator());

      expect(result).toEqual(expectedResult);
    });

    it("should handle the internal zoom out", () => {
      const initialState = true;
      const expectedResult = false;

      const result = reducer(initialState, zoomOut());

      expect(result).toEqual(expectedResult);
    });
  });
});
