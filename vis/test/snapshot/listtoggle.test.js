import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import ListToggle from "../../js/components/ListToggle";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);

describe("List toggle component snapshot", () => {
  it("matches a snapshot", () => {
    const store = mockStore({
      zoom: false,
      // TODO test some real data
      data: [],
      list: {
        show: true,
        searchValue: "",
        filterValue: "",
        filterField: "",
      },
      localization: {
        hide_list: "Liste einklappen",
        items: "Dokumente",
      },
    });
    const tree = renderer
      .create(
        <LocalizationProvider localization={store.getState().localization}>
          <ListToggle store={store} docsNumber={13} />
        </LocalizationProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
