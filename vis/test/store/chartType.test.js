import { initializeStore } from "../../js/actions";

import reducer, {
  STREAMGRAPH_MODE,
  KNOWLEDGEMAP_MODE,
} from "../../js/reducers/chartType";

describe("chartType state", () => {
  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = KNOWLEDGEMAP_MODE;

      const result = reducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should initialize the knowledgemap", () => {
      const initialState = KNOWLEDGEMAP_MODE;
      const expectedResult = KNOWLEDGEMAP_MODE;

      const result = reducer(initialState, initializeStore({ is_streamgraph: false }));

      expect(result).toEqual(expectedResult);
    });

    it("should initialize the streamgraph", () => {
      const initialState = KNOWLEDGEMAP_MODE;
      const expectedResult = STREAMGRAPH_MODE;

      const result = reducer(initialState, initializeStore({ is_streamgraph: true }));

      expect(result).toEqual(expectedResult);
    });
  });
});
