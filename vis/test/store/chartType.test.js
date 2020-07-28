import {
  setNormalChart,
  setStreamgraph
} from "../../js/actions";

import reducer from "../../js/reducers/chartType";

describe("chartType state", () => {
  describe("actions", () => {
    it("should create a normal chart action", () => {
      const expectedAction = {
        type: "SET_NORMAL",
      };
      expect(setNormalChart()).toEqual(expectedAction);
    });

    it("should create a streamgraph chart action", () => {
      const expectedAction = {
        type: "SET_STREAMGRAPH",
      };
      expect(setStreamgraph()).toEqual(expectedAction);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = "normal";

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the normal chart setter", () => {
      const initialState = "normal";
      const expectedResult = "normal";

      const result = reducer(initialState, setNormalChart());

      expect(result).toEqual(expectedResult);
    });

    it("should handle the streamgraph chart setter", () => {
      const initialState = "normal";
      const expectedResult = "streamgraph";

      const result = reducer(initialState, setStreamgraph());

      expect(result).toEqual(expectedResult);
    });
  });
});
