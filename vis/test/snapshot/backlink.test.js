import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import Backlink from "../../js/components/Backlink";

const mockStore = configureStore([]);

describe("Backlink component snapshot", () => {
  it("normal matches as snapshot", () => {
    const store = mockStore({
      zoom: true,
      chartType: "normal",
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <Backlink />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("streamgraph matches as snapshot", () => {
    const store = mockStore({
      zoom: true,
      chartType: "streamgraph",
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <Backlink />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
