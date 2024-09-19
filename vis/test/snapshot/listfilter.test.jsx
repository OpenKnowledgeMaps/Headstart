import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import FilterSort from "../../js/components/FilterSort";

const mockStore = configureStore([]);

describe("List filter component snapshot", () => {
  it("matches a snapshot", () => {
    const store = mockStore({
      list: {
        show: true,
        searchValue: "case study",
        showFilter: true,
        filterValue: "all",
        filterOptions: ["all", "open_access"],
        sortValue: "relevance",
        sortOptions: ["relevance", "year"],
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
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <FilterSort />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
