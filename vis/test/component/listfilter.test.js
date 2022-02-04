import React from "react";
import { Provider } from "react-redux";
import { render, unmountComponentAtNode } from "react-dom";
import ReactTestUtils from 'react-dom/test-utils';
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import { search, filter, sort } from "../../js/actions";

import FilterSort from "../../js/components/FilterSort";

const mockStore = configureStore([]);
const setup = (overrideListObject = {}, overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      list: {
        show: true,
        docsNumber: 0,
        searchValue: "",
        showFilter: false,
        filterValue: null,
        filterOptions: ["all", "open_access"],
        showDropdownSort: true,
        sortValue: null,
        sortOptions: ["relevance", "year"],
        ...overrideListObject,
      },
      localization: {
        search_placeholder: "Search...",
        all: "All",
        open_access: "Open access",
        filter_by_label: "Filter by: ",
        relevance: "Relevance",
        year: "Year",
        sort_by_label: "Sort by: ",
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("List filter component", () => {
  let container = null;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("renders", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <FilterSort />
        </Provider>,
        container
      );
    });

    expect(container.querySelector("#explorer_options")).not.toBe(null);
  });

  describe("search box", () => {
    it("renders with correct value", () => {
      const SEARCH_TEXT = "some text";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#filter_input").getAttribute("value")
      ).toEqual(SEARCH_TEXT);
    });

    it("renders with empty value", () => {
      const SEARCH_TEXT = "";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#searchclear")).toBe(null);
    });

    it("triggers a correct redux action when search box value changes", () => {
      jest.useFakeTimers();

      const SEARCH_TEXT = "some text";
      const EXPECTED_PAYLOAD = search(SEARCH_TEXT);
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      const searchBox = document.getElementById("filter_input");
      act(() => {
        ReactTestUtils.Simulate.change(searchBox);
      });

      jest.advanceTimersByTime(150);

      // testing multiple changes (debounced)
      act(() => {
        ReactTestUtils.Simulate.change(searchBox);
      });

      jest.advanceTimersByTime(300);

      jest.runAllTimers();

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct redux action when clear button clicked", () => {
      const EXPECTED_PAYLOAD = search("");
      const SEARCH_TEXT = "some text";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      const searchClear = document.getElementById("searchclear");
      act(() => {
        const event = new Event("click", { bubbles: true });
        searchClear.dispatchEvent(event);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });

  describe("filter dropdown", () => {
    it("renders with correct value", () => {
      const FILTER_ID = "open_access";
      const storeObject = setup({ showFilter: true, filterValue: FILTER_ID });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#filter_params").textContent).toContain(
        storeObject.localization[FILTER_ID]
      );
    });

    it("triggers a correct redux action when option is clicked", () => {
      const EXPECTED_ID = "all";
      const EXPECTED_PAYLOAD = filter(EXPECTED_ID);
      const FILTER_ID = "open_access";
      const storeObject = setup({ showFilter: true, filterValue: FILTER_ID });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      const filterOption = document.getElementById("filter_option_" + EXPECTED_ID);
      act(() => {
        const event = new Event("click", { bubbles: true });
        filterOption.dispatchEvent(event);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });

  describe("sort dropdown", () => {
    it("renders with correct value", () => {
      const SORT_ID = "relevance";
      const storeObject = setup({
        showFilter: false,
        showDropdownSort: true,
        sortValue: SORT_ID,
      });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#sort").textContent).toContain(
        storeObject.localization[SORT_ID]
      );
    });

    it("triggers a correct redux action when option is clicked", () => {
      const EXPECTED_ID = "year";
      const EXPECTED_PAYLOAD = sort(EXPECTED_ID);
      const SORT_ID = "relevance";
      const storeObject = setup({
        showFilter: false,
        showDropdownSort: true,
        sortValue: SORT_ID,
      });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );
      });

      const sortOption = document.getElementById("sort_option_" + EXPECTED_ID);
      act(() => {
        const event = new Event("click", { bubbles: true });
        sortOption.dispatchEvent(event);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });
});
