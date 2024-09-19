import { expect, describe, it } from 'vitest';

import React from "react";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import ListToggle from "../../js/templates/ListToggle";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);

describe("List toggle component snapshot", () => {
  it("matches a snapshot", () => {
    const store = mockStore({
      zoom: false,
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
