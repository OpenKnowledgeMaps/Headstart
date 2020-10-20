import { toggleList, setItemsCount } from "../../js/actions";

import listReducer from "../../js/reducers/list";

describe("list toggle state", () => {
  describe("actions", () => {
    it("should create a list toggle action", () => {
      const expectedAction = {
        type: "TOGGLE_LIST",
      };
      expect(toggleList()).toEqual(expectedAction);
    });

    it("should create a change of items count action", () => {
      const COUNT = 11;
      const expectedAction = {
        type: "SET_ITEMS_COUNT",
        count: COUNT
      };
      expect(setItemsCount(COUNT)).toEqual(expectedAction);
    });
  });
  
  describe("reducers", () => {
    it("should return the initial state", () => {
      const expectedResult = { show: true, docsNumber: 0 };

      const result = listReducer(undefined, {});

      expect(result).toEqual(expectedResult);
    });

    it("should set show to 'false'", () => {
      const INITIAL_STATE = { show: true, docsNumber: 0 };
      const EXPECTED_STATE = { ...INITIAL_STATE, show: false };

      const result = listReducer(INITIAL_STATE, toggleList());

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set the number of documents", () => {
      const INITIAL_STATE = { show: true, docsNumber: 0 };
      const EXPECTED_STATE = { ...INITIAL_STATE, docsNumber: 42 };

      const result = listReducer(INITIAL_STATE, setItemsCount(42));

      expect(result).toEqual(EXPECTED_STATE);
    });
  });
});
