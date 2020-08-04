import { initializeStore } from "../../js/actions";

import reducer from "../../js/reducers/context";

describe("config state", () => {
  describe("actions", () => {
    it("should create an initialize action", () => {
      const expectedAction = {
        type: "INITIALIZE",
        configObject: {},
        contextObject: {}
      };
      expect(initializeStore({}, {})).toEqual(expectedAction);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = {};

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the initialization", () => {
      const initialState = {};
      const expectedResult = {someValue: "sample text"};

      const result = reducer(initialState, initializeStore({}, {someValue: "sample text"}));

      expect(result).toEqual(expectedResult);
    });
  });
});
