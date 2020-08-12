import React from "react";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import ContextLine from "../../js/components/ContextLine";

const mockStore = configureStore([]);

const setup = (
  overrideContextLine = {},
  overrideLocalization = {},
  overrideStoreObject = {}
) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      contextLine: {
        articlesCount: 100, // context.num_documents
        modifier: null, // context.params.sorting => most-recent || most-relevant
        showModifierPopover: false, // context.params.sorting === "most-relevant" && config.context_most_relevant_tooltip
        openAccessCount: null, // config.show_context_oa_number => context.share_oa
        showAuthor: false, // config.is_authorview && context.params.author_id
        author: {
          id: null, // context.params.author_id
          livingDates: null, // context.params.living_dates
        },
        documentTypes: null,
        dataSource: "Sample data source",
        timespan: null,
        paperCount: null,
        datasetCount: null,
        funder: null,
        projectRuntime: null,
        searchLanguage: null,
        timestamp: null,
        ...overrideContextLine,
      },
      localization: {
        most_recent_label: "most recent",
        most_relevant_label: "most relevant",
        most_relevant_tooltip: "Sample most relevant tooltip",
        articles_label: "documents",
        bio_link: "Sample author bio link",
        documenttypes_label: "Document types",
        documenttypes_tooltip: "Sample document types tooltip",
        source_label: "Source",
        paper_count_label: "Sample paper count label",
        dataset_count_label: "Sample dataset count label",
        timestamp_label: "Last updated",
        ...overrideLocalization,
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("Context line component snapshot", () => {
  it("matches as project website snapshot", () => {
    const store = mockStore(
      setup({
        modifier: "most-relevant",
        showModifierPopover: true,
        openAccessCount: 52,
        documentTypes: ["Journal/newspaper article"],
        dataSource: "BASE",
        timespan: "All time",
      })
    );

    const tree = renderer
      .create(
        <Provider store={store}>
          <ContextLine />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches as covis snapshot", () => {
    const store = mockStore(
      setup({
        articlesCount: 76,
        openAccessCount: 34,
        // TODO needs HTML with a link
        dataSource: "CoVis database",
        timestamp: "2020-08-12 02:40:04 UTC"
      }, {
        articles_label: "resources and collections",
        source_label: "Data source"
      })
    );

    const tree = renderer
      .create(
        <Provider store={store}>
          <ContextLine />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
