import { expect, describe, it, vitest } from 'vitest';
import React from "react";
import { Provider } from "react-redux";
import { render, fireEvent } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { search, filter, sort } from "../../js/actions";
import FilterSort from "../../js/components/FilterSort";
import LocalizationProvider from '../../js/components/LocalizationProvider';

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
  it("renders", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <FilterSort />
      </Provider>
    );

    expect(result.container.querySelector("#explorer_options")).not.toBe(null);
  });

  describe("search box", () => {
    it("renders with correct value", () => {
      const SEARCH_TEXT = "some text";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      expect(
        result.container.querySelector("#filter_input").getAttribute("value")
      ).toEqual(SEARCH_TEXT);
    });

    it("renders with empty value", () => {
      const SEARCH_TEXT = "";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      expect(result.container.querySelector("#searchclear")).toBe(null);
    });

    // ? temporarily disabled due to the use of fake timers
    // it("triggers a correct redux action when search box value changes", () => {
    //   vitest.useFakeTimers();

    //   const SEARCH_TEXT = "some text";
    //   const EXPECTED_PAYLOAD = search(SEARCH_TEXT);
    //   const storeObject = setup({ 
    //     searchValue: SEARCH_TEXT,
    //     showFilter: true
    //   });
    //   const store = mockStore(storeObject);

    //   const result = render(
    //     <Provider store={store}>
    //       <LocalizationProvider localization={storeObject.localization}>
    //         <FilterSort />
    //       </LocalizationProvider>
    //     </Provider>
    //   );

    //   const searchBox = result.container.querySelector("#filter_input");
    //   expect(searchBox).not.toBe(null);

    //   fireEvent.change(searchBox, { target: { value: SEARCH_TEXT } });

    //   vitest.advanceTimersByTime(150);

    //   // testing multiple changes (debounced)
    //   fireEvent.change(searchBox, { target: { value: SEARCH_TEXT } });

    //   vitest.advanceTimersByTime(300);

    //   vitest.runAllTimers();
      
    //   const actions = store.getActions();
      
    //   expect(actions).toEqual([EXPECTED_PAYLOAD]);
    // });

    it("triggers a correct redux action when clear button clicked", () => {
      const EXPECTED_PAYLOAD = search("");
      const SEARCH_TEXT = "some text";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      const searchClear = result.container.querySelector("#searchclear");
      fireEvent.click(searchClear);

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });

  describe("filter dropdown", () => {
    it("renders with correct value", () => {
      const FILTER_ID = "open_access";
      const storeObject = setup({ showFilter: true, filterValue: FILTER_ID });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      expect(result.container.querySelector("#filter_params").textContent).toContain(
        storeObject.localization[FILTER_ID]
      );
    });

    it("triggers a correct redux action when option is clicked", () => {
      const EXPECTED_ID = "all";
      const EXPECTED_PAYLOAD = filter(EXPECTED_ID);
      const FILTER_ID = "open_access";
      const storeObject = setup({ showFilter: true, filterValue: FILTER_ID });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      const filterOption = result.container.querySelector("#filter_option_" + EXPECTED_ID);
      fireEvent.click(filterOption);

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

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      expect(result.container.querySelector("#sort").textContent).toContain(
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

      const result = render(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      );

      const sortOption = result.container.querySelector("#sort_option_" + EXPECTED_ID);
      fireEvent.click(sortOption);

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });
});
