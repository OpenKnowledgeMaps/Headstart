import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import renderer from "react-test-renderer";

import data, {
  baseConfig as config,
  baseContext as context,
} from "../data/base";
import { initializeStore, selectPaper } from "../../js/actions";

import List from "../../js/components/List";

import reducer from "../../js/reducers";

const PAPER_OA_SAFE_ID =
  "008ea92dafd41bdb55abf7cb8b4f43deb52ac003a2b15a8c5eb8743ae021533d";

const setup = () => {
  const store = createStore(reducer);
  store.dispatch(initializeStore(config, context, data));

  return store;
};

/**
 * Extra test suite for testing BASE data integration on real data, config and context.
 */
describe("List entries component snapshot (BASE)", () => {
  it("matches a snapshot (zoomed-out)", () => {
    const store = setup();

    const tree = renderer
      .create(
        <Provider store={store}>
          <List />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches a snapshot (zoomed-in, paper selected)", () => {
    const store = setup();
    store.dispatch(
      selectPaper(
        // open access paper
        data.find((p) => p.safe_id === PAPER_OA_SAFE_ID)
      )
    );

    const tree = renderer
      .create(
        <Provider store={store}>
          <List />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
