import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import ContextLine from "../../js/components/ContextLine";

const mockStore = configureStore([]);
const setup = (overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      contextLine: {
        show: true, // config.show_context && context.params
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
    const store = mockStore(setup());
    act(() => {
      render(<ContextLine store={store} />, container);
    });

    expect(container.childNodes.length).toBe(1);
  });

  it("is hidden (zoomed-in)", () => {
    const store = mockStore(setup({ zoom: true }));
    act(() => {
      render(<ContextLine store={store} />, container);
    });

    expect(container.childNodes.length).toBe(0);
  });

  it("is hidden (not shown)", () => {
    const storeObject = setup();
    storeObject.contextLine.show = false;

    const store = mockStore(storeObject);

    act(() => {
      render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#source")).toBe(null);
    });

    it("contains a correct data source", () => {
      const DATA_SOURCE = "Custom data source";
      const storeObject = setup();
      storeObject.contextLine.dataSource = DATA_SOURCE;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(
        container.querySelector("#source").querySelector("a.underline")
          .textContent
      ).toContain("CoVis database");
    });

    it("doesn't contain the timespan", () => {
      const TIMESPAN = undefined;
      const storeObject = setup();
      storeObject.contextLine.timespan = TIMESPAN;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#timespan")).toBe(null);
    });

    it("contains a correct timespan", () => {
      const TIMESPAN = "Custom timespan";
      const storeObject = setup();
      storeObject.contextLine.timespan = TIMESPAN;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#context-paper_count")).toBe(null);
    });

    it("contains a correct paper count", () => {
      const PAPER_COUNT = 420;
      const storeObject = setup();
      storeObject.contextLine.paperCount = PAPER_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#context-paper_count")).toBe(null);
    });

    it("contains a correct dataset count", () => {
      const DATASET_COUNT = 12345;
      const storeObject = setup();
      storeObject.contextLine.datasetCount = DATASET_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#context-funder")).toBe(null);
    });

    it("contains a correct funder", () => {
      const FUNDER = "Custom funder";
      const storeObject = setup();
      storeObject.contextLine.funder = FUNDER;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#context-project_runtime")).toBe(null);
    });

    it("contains a correct project runtime", () => {
      const PROJ_RUNTIME = "Custom project runtime";
      const storeObject = setup();
      storeObject.contextLine.projectRuntime = PROJ_RUNTIME;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(
        container.querySelector("#context-project_runtime").textContent
      ).toEqual(PROJ_RUNTIME);
    });

    it("doesn't contain a search language", () => {
      const SEARCH_LANG = undefined;
      const storeObject = setup();
      storeObject.contextLine.searchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#search_lang")).toBe(null);
    });

    it("contains a correct search language", () => {
      const SEARCH_LANG = "Custom search language";
      const storeObject = setup();
      storeObject.contextLine.searchLanguage = SEARCH_LANG;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#search_lang").textContent).toEqual(
        SEARCH_LANG
      );
    });

    it("doesn't contain a timestamp", () => {
      const TIMESTAMP = undefined;
      const storeObject = setup();
      storeObject.contextLine.timestamp = TIMESTAMP;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#timestamp")).toBe(null);
    });

    it("contains a correct timestamp", () => {
      const TIMESTAMP = "Custom timestamp";
      const storeObject = setup();
      storeObject.contextLine.timestamp = TIMESTAMP;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#timestamp").textContent).toContain(
        TIMESTAMP
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#num_articles").textContent).toMatch(
        new RegExp(`^${ARTICLES_COUNT}`)
      );
    });

    it("contains a correct modifier label (no modifier)", () => {
      const MODIFIER = null;
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#modifier").textContent).toEqual("");
    });

    it("contains a correct modifier label (most recent)", () => {
      const MODIFIER = "most-recent";
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
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
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#document_types")).toBe(null);
    });

    it("has one document type", () => {
      const DOC_TYPES = ["custom document type"];

      const storeObject = setup();
      storeObject.contextLine.documentTypes = DOC_TYPES;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#document_types").textContent).toEqual(
        `${storeObject.localization.documenttypes_label}: ${DOC_TYPES[0]}`
      );
    });

    it("has more document types", () => {
      const DOC_TYPES = ["custom document type", "another document type"];

      const storeObject = setup();
      storeObject.contextLine.documentTypes = DOC_TYPES;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#document_types").textContent).toEqual(
        storeObject.localization.documenttypes_label
      );

      expect(
        container.querySelector("#document_types").getAttribute("data-content")
      ).toContain(storeObject.localization.documenttypes_tooltip);

      expect(
        container.querySelector("#document_types").getAttribute("data-content")
      ).toContain(DOC_TYPES[0]);

      expect(
        container.querySelector("#document_types").getAttribute("data-content")
      ).toContain(DOC_TYPES[1]);
    });
  });
});
