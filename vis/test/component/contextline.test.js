import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import { Provider } from "react-redux";

import ContextLine from "../../js/components/ContextLine";
import LocalizationProvider from "../../js/components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../js/reducers/chartType";
import { openInfoModal } from "../../js/actions";

const mockStore = configureStore([]);
const setup = (overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      timespan: null,
      contextLine: {
        show: true, // config.show_context && context.params
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
        searchLanguage: null,
        timestamp: null,
      },
      localization: {
        most_recent_label: "most recent",
        most_relevant_label: "most relevant",
        most_relevant_tooltip: "Sample most relevant tooltip",
        articles_label: "Sample articles label",
        bio_link: "Sample author bio link",
        documenttypes_label: "Sample document types label",
        documenttypes_tooltip: "Sample document types tooltip",
        source_label: "Sample source label",
        paper_count_label: "Sample paper count label",
        dataset_count_label: "Sample dataset count label",
        timestamp_label: "Sample timestamp label",
        high_metadata_quality: "high metadata quality",
        high_metadata_quality_desc_base: "Sample BASE high quality description",
        high_metadata_quality_desc_pubmed:
          "Sample PubMed high quality description",
        low_metadata_quality: "low metadata quality",
        low_metadata_quality_desc_base: "Sample BASE low quality description",
        low_metadata_quality_desc_pubmed:
          "Sample PubMed low quality description",
        lang_all: "All languages",
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

/**
 * The tests here test the context line part by part.
 *
 * For complete tests of each setup, snapshot tests are created
 * (see snapshot/contextline.test.js).
 */
describe("Context line component", () => {
  let container = null;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  /**
   * Basic render tests
   */
  it("renders", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);
    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={storeObject.localization}>
            <ContextLine />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.childNodes.length).toBe(1);
  });

  it("is hidden (zoomed-in)", () => {
    const storeObject = setup({ zoom: true });
    const store = mockStore(storeObject);
    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={storeObject.localization}>
            <ContextLine />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.childNodes.length).toBe(0);
  });

  it("is hidden (not shown)", () => {
    const storeObject = setup();
    storeObject.contextLine.show = false;

    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={storeObject.localization}>
            <ContextLine />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.childNodes.length).toBe(0);
  });

  describe("small items part", () => {
    it("doesn't contain the data source", () => {
      const DATA_SOURCE = undefined;
      const storeObject = setup();
      storeObject.contextLine.dataSource = DATA_SOURCE;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#source")).toBe(null);
    });

    it("contains a correct data source", () => {
      const DATA_SOURCE = "Custom data source";
      const storeObject = setup();
      storeObject.contextLine.dataSource = DATA_SOURCE;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#source").textContent).toContain(
        DATA_SOURCE
      );
    });

    it("contains a correct data source with HTML", () => {
      const DATA_SOURCE =
        '<span class="backlink"><a href="data" class="underline" target="_blank" >CoVis database</a></span>';
      const storeObject = setup();
      storeObject.contextLine.dataSource = DATA_SOURCE;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#source").querySelector("a.underline")
          .textContent
      ).toContain("CoVis database");
    });

    it("doesn't contain a timespan", () => {
      const TIMESPAN = undefined;
      const storeObject = setup();
      storeObject.timespan = TIMESPAN;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#timespan")).toBe(null);
    });

    it("contains a correct timespan", () => {
      const TIMESPAN = "Custom timespan";
      const storeObject = setup();
      storeObject.timespan = TIMESPAN;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#timespan").textContent).toEqual(
        TIMESPAN
      );
    });

    it("doesn't contain the paper count", () => {
      const PAPER_COUNT = undefined;
      const storeObject = setup();
      storeObject.contextLine.paperCount = PAPER_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#context-paper_count")).toBe(null);
    });

    it("contains a correct paper count", () => {
      const PAPER_COUNT = 420;
      const storeObject = setup();
      storeObject.contextLine.paperCount = PAPER_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#context-paper_count").textContent
      ).toContain(PAPER_COUNT.toString());
    });

    it("doesn't contain the dataset count", () => {
      const DATASET_COUNT = undefined;
      const storeObject = setup();
      storeObject.contextLine.datasetCount = DATASET_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#context-paper_count")).toBe(null);
    });

    it("contains a correct dataset count", () => {
      const DATASET_COUNT = 12345;
      const storeObject = setup();
      storeObject.contextLine.datasetCount = DATASET_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#context-dataset_count").textContent
      ).toContain(DATASET_COUNT.toString());
    });

    it("doesn't contain a funder", () => {
      const FUNDER = undefined;
      const storeObject = setup();
      storeObject.contextLine.funder = FUNDER;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#context-funder")).toBe(null);
    });

    it("contains a correct funder", () => {
      const FUNDER = "Custom funder";
      const storeObject = setup();
      storeObject.contextLine.funder = FUNDER;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#context-funder").textContent).toContain(
        FUNDER
      );
    });

    it("doesn't contain a project runtime", () => {
      const PROJ_RUNTIME = undefined;
      const storeObject = setup();
      storeObject.contextLine.projectRuntime = PROJ_RUNTIME;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#context-project_runtime")).toBe(null);
    });

    it("contains a correct project runtime", () => {
      const PROJ_RUNTIME = "Custom project runtime";
      const storeObject = setup();
      storeObject.contextLine.projectRuntime = PROJ_RUNTIME;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#context-project_runtime").textContent
      ).toEqual(PROJ_RUNTIME);
    });

    it("doesn't contain a search language (base legacy)", () => {
      const SEARCH_LANG = undefined;
      const storeObject = setup();
      storeObject.contextLine.legacySearchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#legacy_search_lang")).toBe(null);
    });

    it("contains a correct search language (base legacy)", () => {
      const SEARCH_LANG = "Custom search language";
      const storeObject = setup();
      storeObject.contextLine.legacySearchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#legacy_search_lang").textContent
      ).toEqual(SEARCH_LANG);
    });

    it("doesn't contain a timestamp", () => {
      const TIMESTAMP = undefined;
      const storeObject = setup();
      storeObject.contextLine.timestamp = TIMESTAMP;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#timestamp")).toBe(null);
    });

    it("contains a correct timestamp", () => {
      const TIMESTAMP = "Custom timestamp";
      const storeObject = setup();
      storeObject.contextLine.timestamp = TIMESTAMP;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#timestamp").textContent).toContain(
        TIMESTAMP
      );
    });

    it("contains English search language (triple)", () => {
      const SEARCH_LANG = "en";
      const storeObject = setup();
      storeObject.contextLine.searchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#search_lang").textContent).toEqual(
        "English"
      );
    });

    it("contains all search languages (triple)", () => {
      const SEARCH_LANG = "all";
      const storeObject = setup();
      storeObject.contextLine.searchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#search_lang").textContent).toEqual(
        storeObject.localization.lang_all
      );
    });
  });

  describe("author info part", () => {
    it("doesn't contain the author info part", () => {
      const SHOW_AUTHOR = false;
      const storeObject = setup();
      storeObject.contextLine.showAuthor = SHOW_AUTHOR;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#author_living_dates")).toBe(null);
      expect(container.querySelector("#author_bio")).toBe(null);
    });

    it("contains correct living dates", () => {
      const SHOW_AUTHOR = true;
      const AUTHOR = {
        id: "some_id",
        livingDates: "1799-1864",
      };
      const storeObject = setup();
      storeObject.contextLine.showAuthor = SHOW_AUTHOR;
      storeObject.contextLine.author = AUTHOR;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#author_living_dates").textContent
      ).toEqual(AUTHOR.livingDates);
    });

    it("contains correct bio link", () => {
      const SHOW_AUTHOR = true;
      const AUTHOR = {
        id: "some_id",
        livingDates: "1799-1864",
      };
      const storeObject = setup();
      storeObject.contextLine.showAuthor = SHOW_AUTHOR;
      storeObject.contextLine.author = AUTHOR;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(
        container.querySelector("#author_bio_link").getAttribute("href")
      ).toEqual("https://d-nb.info/gnd/" + AUTHOR.id);
    });
  });

  describe("article numbers part", () => {
    it("contains a correct articles number", () => {
      const ARTICLES_COUNT = 42;
      const storeObject = setup();
      storeObject.contextLine.articlesCount = ARTICLES_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#num_articles").textContent).toMatch(
        new RegExp(`^${ARTICLES_COUNT}`)
      );
    });

    it("doesn't contain a modifier", () => {
      const MODIFIER = null;
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#modifier")).toBe(null);
    });

    it("contains a correct modifier label (most recent)", () => {
      const MODIFIER = "most-recent";
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#modifier").textContent).toEqual(
        storeObject.localization.most_recent_label
      );
    });

    it("contains a correct modifier label (most relevant)", () => {
      const MODIFIER = "most-relevant";
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#modifier").textContent).toEqual(
        storeObject.localization.most_relevant_label
      );
    });

    it("contains a correct modifier label in streamgraph (most relevant)", () => {
      const MODIFIER = "most-relevant";
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;
      storeObject.chartType = STREAMGRAPH_MODE;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#modifier").textContent).toEqual(
        storeObject.localization.most_relevant_label
      );
    });

    it("contains a number of open access articles", () => {
      const OPEN_ACCESS_COUNT = 12;
      const storeObject = setup();
      storeObject.contextLine.openAccessCount = OPEN_ACCESS_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#num_articles").textContent).toMatch(
        new RegExp(`\\(${OPEN_ACCESS_COUNT} open access\\)$`)
      );
    });

    it("doesn't contain a number of open access articles", () => {
      const OPEN_ACCESS_COUNT = undefined;
      const storeObject = setup();
      storeObject.contextLine.openAccessCount = OPEN_ACCESS_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#num_articles").textContent).not.toMatch(
        new RegExp(`open access\\)$`)
      );
    });
  });

  describe("document types part", () => {
    it("doesn't contain the document types", () => {
      const DOC_TYPES = undefined;
      const storeObject = setup();
      storeObject.contextLine.documentTypes = DOC_TYPES;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#document_types")).toBe(null);
    });

    it("has document types", () => {
      const DOC_TYPES = ["custom document type", "another document type"];

      const storeObject = setup();
      storeObject.contextLine.documentTypes = DOC_TYPES;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#document_types").textContent).toEqual(
        storeObject.localization.documenttypes_label
      );

      expect(
        container.querySelector("#document_types").getAttribute("class")
      ).toContain("context_item");

      expect(
        container.querySelector("#document_types>span").getAttribute("class")
      ).toContain("context_moreinfo");
    });

    it("shows a popover if hovered on more document types", () => {
      const DOC_TYPES = ["custom document type", "another document type"];

      const storeObject = setup();
      storeObject.contextLine.documentTypes = DOC_TYPES;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#document_types>span");
      act(() => {
        const event = new Event("mouseover", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(
        container.querySelector("#doctypes-popover").textContent
      ).toContain(storeObject.localization.documenttypes_tooltip);

      expect(
        container.querySelector("#doctypes-popover").textContent
      ).toContain(DOC_TYPES[0]);

      expect(
        container.querySelector("#doctypes-popover").textContent
      ).toContain(DOC_TYPES[1]);
    });
  });

  describe("metadata quality part", () => {
    it("doesn't contain metadata quality", () => {
      const QUALITY = undefined;
      const storeObject = setup();
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#metadata_quality")).toBe(null);
    });

    it("contains incorrect metadata quality", () => {
      const QUALITY = "random";
      const storeObject = setup();
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#metadata_quality")).toBe(null);
    });

    it("contains correct metadata quality label (low)", () => {
      const QUALITY = "low";
      const SERVICE = "base";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#metadata_quality").textContent).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality`]
      );
    });

    it("contains correct metadata quality label (high)", () => {
      const QUALITY = "high";
      const SERVICE = "base";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <ContextLine />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(container.querySelector("#metadata_quality").textContent).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality`]
      );
    });

    it("shows a correct popover (low base)", () => {
      const QUALITY = "low";
      const SERVICE = "base";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#metadata_quality>span");
      act(() => {
        const event = new Event("mouseover", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(
        container.querySelector("#metadata-quality-popover").textContent
      ).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality_desc_${SERVICE}`]
      );
    });

    it("shows a correct popover (low pubmed)", () => {
      const QUALITY = "low";
      const SERVICE = "pubmed";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#metadata_quality>span");
      act(() => {
        const event = new Event("mouseover", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(
        container.querySelector("#metadata-quality-popover").textContent
      ).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality_desc_${SERVICE}`]
      );
    });

    it("shows a correct popover (high base)", () => {
      const QUALITY = "high";
      const SERVICE = "base";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#metadata_quality>span");
      act(() => {
        const event = new Event("mouseover", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(
        container.querySelector("#metadata-quality-popover").textContent
      ).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality_desc_${SERVICE}`]
      );
    });

    it("shows a correct popover (high pubmed)", () => {
      const QUALITY = "high";
      const SERVICE = "pubmed";
      const storeObject = setup({ service: SERVICE });
      storeObject.contextLine.metadataQuality = QUALITY;

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#metadata_quality>span");
      act(() => {
        const event = new Event("mouseover", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(
        container.querySelector("#metadata-quality-popover").textContent
      ).toEqual(
        storeObject.localization[`${QUALITY}_metadata_quality_desc_${SERVICE}`]
      );
    });

    it("triggers a correct redux action when info icon is clicked", () => {
      const SERVICE = "pubmed";
      const storeObject = setup({ service: SERVICE });

      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <MockContextLineContainer />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector("#more-info-link button");
      act(() => {
        const event = new Event("click", { bubbles: true });
        select.dispatchEvent(event);
      });

      const actions = store.getActions();
      const expectedPayload = openInfoModal()

      expect(actions).toEqual([expectedPayload]);
    });
  });
});

class MockContextLineContainer extends React.Component {
  render() {
    return (
      <div id="subdiscipline_title" style={{ position: "relative" }}>
        <ContextLine popoverContainer={this} />
      </div>
    );
  }
}
