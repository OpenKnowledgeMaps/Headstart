import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import Backlink from "../../js/components/Backlink";

import { STREAMGRAPH_MODE } from "../../js/reducers/chartType";

const mockStore = configureStore([]);

describe("Backlink component snapshot", () => {
  it("matches as knowledgeMap snapshot", () => {
    const store = mockStore({
      zoom: true,
      chartType: "knowledgeMap",
      localization: {
        backlink: "← Back to overview",
      },
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

  it("matches as streamgraph snapshot", () => {
    const store = mockStore({
      zoom: true,
      chartType: STREAMGRAPH_MODE,
      localization: {
        backlink: "← Back to overview",
      },
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
