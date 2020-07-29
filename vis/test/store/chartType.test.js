import {
  setKnowledgeMap,
  setStreamgraph
} from "../../js/actions";

import reducer from "../../js/reducers/chartType";

describe("chartType state", () => {
  describe("actions", () => {
    it("should create a knowledgeMap chart action", () => {
      const expectedAction = {
        type: "SET_KNOWLEDGE_MAP",
      };
      expect(setKnowledgeMap()).toEqual(expectedAction);
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
      const expectedResult = "knowledgeMap";

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should handle the knowledgeMap chart setter", () => {
      const initialState = "knowledgeMap";
      const expectedResult = "knowledgeMap";

      const result = reducer(initialState, setKnowledgeMap());

      expect(result).toEqual(expectedResult);
    });

    it("should handle the streamgraph chart setter", () => {
      const initialState = "knowledgeMap";
      const expectedResult = "streamgraph";

      const result = reducer(initialState, setStreamgraph());

      expect(result).toEqual(expectedResult);
    });
  });
});
