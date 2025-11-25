import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import ContextLine from "../../js/components/ContextLine";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);

const setup = (
  overrideContextLine = {},
  overrideLocalization = {},
  overrideStoreObject = {},
) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      timespan: null,
      contextLine: {
        show: true,
        articlesCount: 100, // context.num_documents
        modifier: null, // context.params.sorting => most-recent || most-relevant
        openAccessCount: null, // config.show_context_oa_number => context.share_oa
        showAuthor: false, // config.is_authorview && context.params.author_id
        author: {
          id: null, // context.params.author_id
          livingDates: null, // context.params.living_dates
        },
        documentTypes: null,
        dataSource: "Sample data source",
        paperCount: null,
        datasetCount: null,
        funder: null,
        projectRuntime: null,
        legacySearchLanguage: null,
        timestamp: null,
        ...overrideContextLine,
      },
      localization: {
        most_recent_label: "most recent",
        most_relevant_label: "most relevant",
        most_relevant_tooltip: "Sample most relevant tooltip",
        articles_label: "documents",
        bio_link: "Biografie",
        documenttypes_label: "Document types",
        documenttypes_tooltip: "Sample document types tooltip",
        source_label: "Source",
        paper_count_label: "papers",
        dataset_count_label: "datasets",
        timestamp_label: "Last updated",
        high_metadata_quality: "high metadata quality",
        high_metadata_quality_desc_base:
          "This knowledge map only includes documents with an abstract (min. 300 characters). High metadata quality significantly improves the quality of your knowledge map.",
        high_metadata_quality_desc_pubmed:
          "This knowledge map only includes documents with an abstract. High metadata quality significantly improves the quality of your knowledge map.",
        low_metadata_quality: "low metadata quality",
        low_metadata_quality_desc_base:
          "This knowledge map includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your knowledge map. ",
        low_metadata_quality_desc_pubmed:
          "This knowledge map includes documents with and without an abstract. Low metadata quality may significantly reduce the quality of your knowledge map. ",

        ...overrideLocalization,
      },
    },
    overrideStoreObject,
  );

  return storeObject;
};

describe("Context line component snapshot", () => {
  it("matches a project website (base low quality) snapshot", () => {
    const store = mockStore(
      setup(
        {
          modifier: "most-relevant",
          openAccessCount: 52,
          documentTypes: ["Journal/newspaper article"],
          dataSource: "BASE",
          metadataQuality: "low",
        },
        {},
        {
          service: "base",
          timespan: "All time",
        },
      ),
    );

    const tree = renderer
      .create(
        <LocalizationProvider localization={store.getState().localization}>
          <Provider store={store}>
            <ContextLine />
          </Provider>
        </LocalizationProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches a project website (pubmed high quality) snapshot", () => {
    const store = mockStore(
      setup(
        {
          modifier: "most-relevant",
          openAccessCount: 52,
          documentTypes: ["Journal/newspaper article"],
          dataSource: "PubMed",
          metadataQuality: "high",
        },
        {},
        {
          service: "pubmed",
          timespan: "All time",
        },
      ),
    );

    const tree = renderer
      .create(
        <LocalizationProvider localization={store.getState().localization}>
          <Provider store={store}>
            <ContextLine />
          </Provider>
        </LocalizationProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches a linkedcat authorview snapshot", () => {
    const store = mockStore(
      setup(
        {
          showAuthor: true,
          author: {
            id: "100016642",
            livingDates: "1791-1863",
          },
          articlesCount: 45,
          dataSource: "LinkedCat+",
        },
        {
          articles_label: "open access Dokumente",
          source_label: "Quelle",
        },
      ),
    );

    const tree = renderer
      .create(
        <LocalizationProvider localization={store.getState().localization}>
          <Provider store={store}>
            <ContextLine />
          </Provider>
        </LocalizationProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches a linkedcat keywordview snapshot", () => {
    const store = mockStore(
      setup(
        {
          articlesCount: 295,
          dataSource: "LinkedCat+",
          documentTypes: [
            "Anthologie",
            "Bericht",
            "Biografie",
            "Briefsammlung",
          ],
        },
        {
          articles_label: "open access Dokumente",
          source_label: "Quelle",
          documenttypes_tooltip:
            "Die folgenden Publikationsarten wurden bei der Erstellung dieser Visualisierung in Betracht gezogen (nicht alle davon scheinen notwendigerweise in dieser Visualisierung auch auf)",
          documenttypes_label: "Dokumentarten",
        },
        {
          timespan: "1 Jan 1847 - 1 Jan 1918",
        },
      ),
    );

    const tree = renderer
      .create(
        <LocalizationProvider localization={store.getState().localization}>
          <Provider store={store}>
            <ContextLine />
          </Provider>
        </LocalizationProvider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
