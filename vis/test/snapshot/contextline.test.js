import React from "react";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import ContextLine from "../../js/components/ContextLine";

const mockStore = configureStore([]);

// TODO snapshot for each setup

/*
describe("Context line component snapshot", () => {
  it("matches as knowledgeMap snapshot", () => {
    const store = mockStore({
      zoom: true,
      chartType: "knowledgeMap",
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
*/
