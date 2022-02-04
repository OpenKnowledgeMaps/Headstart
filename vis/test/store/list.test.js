import {
  toggleList,
  showList,
  search,
  filter,
  sort,
  highlightArea,
  updateDimensions,
} from "../../js/actions";

import listReducer from "../../js/reducers/list";

describe("list state", () => {
  describe("actions", () => {
    it("should create a list toggle action", () => {
      const EXPECTED_ACTION = {
        type: "TOGGLE_LIST",
      };
      expect(toggleList()).toEqual(EXPECTED_ACTION);
    });

    it("should create a list show action", () => {
      const EXPECTED_ACTION = {
        type: "SHOW_LIST",
      };
      expect(showList()).toEqual(EXPECTED_ACTION);
    });

    it("should create a list search action", () => {
      const TEXT = "some text";
      const EXPECTED_ACTION = {
        type: "SEARCH",
        text: TEXT,
      };
      expect(search(TEXT)).toEqual(EXPECTED_ACTION);
    });

    it("should create a list filter action", () => {
      const FILTER_ID = "some_id";
      const EXPECTED_ACTION = {
        type: "FILTER",
        id: FILTER_ID,
      };
      expect(filter(FILTER_ID)).toEqual(EXPECTED_ACTION);
    });

    it("should create a list sort action", () => {
      const SORT_ID = "some_id";
      const EXPECTED_ACTION = {
        type: "SORT",
        id: SORT_ID,
      };
      expect(sort(SORT_ID)).toEqual(EXPECTED_ACTION);
    });

    it("should create a hover area action", () => {
      const PAPER = {
        id: "some-id",
        safe_id: "some-safe-id",
        title: "some title",
        area_uri: "some-area-uri",
      };
      const EXPECTED_ACTION = {
        type: "HIGHLIGHT_AREA",
        uri: PAPER.area_uri,
      };
      expect(highlightArea(PAPER)).toEqual(EXPECTED_ACTION);
    });
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      const EXPECTED_STATE = {
        show: true,
        searchValue: "",
        showFilter: false,
        filterField: null,
        filterValue: null,
        filterOptions: [],
        sortValue: null,
        sortOptions: [],
        defaultSort: null,
        abstractSize: 250,
        showDocumentType: false,
        showMetrics: false,
        isContentBased: false,
        baseUnit: null,
        showKeywords: false,
        hideUnselectedKeywords: true,
        height: null,
      };

      const result = listReducer(undefined, {});

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set show to 'false'", () => {
      const INITIAL_STATE = { show: true, docsNumber: 0 };
      const EXPECTED_STATE = { ...INITIAL_STATE, show: false };

      const result = listReducer(INITIAL_STATE, toggleList());

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set show to 'true'", () => {
      const INITIAL_STATE = { show: false, docsNumber: 0 };
      const EXPECTED_STATE = { ...INITIAL_STATE, show: true };

      const result = listReducer(INITIAL_STATE, showList());

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set search value to some text", () => {
      const TEXT = "some text";
      const INITIAL_STATE = { searchValue: "" };
      const EXPECTED_STATE = { ...INITIAL_STATE, searchValue: TEXT };

      const result = listReducer(INITIAL_STATE, search(TEXT));

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set filter value to some id", () => {
      const ID = "some_id";
      const INITIAL_STATE = { filterValue: null };
      const EXPECTED_STATE = { ...INITIAL_STATE, filterValue: ID };

      const result = listReducer(INITIAL_STATE, filter(ID));

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set sort value to some id", () => {
      const ID = "some_id";
      const INITIAL_STATE = { sortValue: null };
      const EXPECTED_STATE = { ...INITIAL_STATE, sortValue: ID };

      const result = listReducer(INITIAL_STATE, sort(ID));

      expect(result).toEqual(EXPECTED_STATE);
    });

    it("should set correct resized height", () => {
      const INITIAL_STATE = { height: 800 };
      const EXPECTED_STATE = { ...INITIAL_STATE, height: 500 };

      const result = listReducer(
        INITIAL_STATE,
        updateDimensions({}, { height: 500 })
      );

      expect(result).toEqual(EXPECTED_STATE);
    });
  });
});
