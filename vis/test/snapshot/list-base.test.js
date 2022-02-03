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
import LocalizationProvider from "../../js/components/LocalizationProvider";
import { getAuthorsList } from "../../js/utils/data";

const PAPER_OA_SAFE_ID =
  "18cabd2db11b6c2f6108b9fb11d07ce9ec55f2b3037f6cac6e1ea00710728958";

const setup = () => {
  data.forEach((d) => (d.authors_list = getAuthorsList(d.authors, true)));

  const store = createStore(reducer);
  store.dispatch(
    initializeStore(config, context, data, [], null, 800, null, null, 800, {
      bubbleMinScale: config.bubble_min_scale,
      bubbleMaxScale: config.bubble_max_scale,
      paperMinScale: config.paper_min_scale,
      paperMaxScale: config.paper_max_scale,
    })
  );

  return store;
};

const localization = config.localization.eng_pubmed;

/**
 * Extra test suite for testing BASE data integration on real data, config and context.
 */
describe("List entries component snapshot (BASE)", () => {
  it("matches a snapshot (zoomed-out)", () => {
    const store = setup();

    const tree = renderer
      .create(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
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
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
