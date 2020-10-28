import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import ListToggle from "../../js/components/ListToggle";

const mockStore = configureStore([]);

describe("List toggle component snapshot", () => {
  it("matches a snapshot", () => {
    const store = mockStore({
      list: {
        show: true,
        docsNumber: 42,
      },
      localization: {
        hide_list: "Liste einklappen",
        items: "Dokumente",
      },
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <ListToggle />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
