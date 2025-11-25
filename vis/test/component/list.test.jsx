import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { describe, expect, it } from "vitest";

import { zoomIn } from "../../js/actions";
import List from "../../js/components/List";
import LocalizationProvider from "../../js/components/LocalizationProvider";
import defaultConfig from "../../js/default-config";
import { KNOWLEDGEMAP_MODE } from "../../js/reducers/chartType";
import localData from "../data/local-files";
import pubmedData from "../data/pubmed";
import initialTestData from "../data/simple";

const localization = defaultConfig.localization.eng;

const mockStore = configureStore([]);
const setup = (
  overrideDataObject = {},
  overrideListObject = {},
  overrideStoreObject = {},
) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      data: {
        list: initialTestData,
        options: {},
        size: 100,
        ...overrideDataObject,
      },
      list: {
        show: true,
        searchValue: "",
        showFilter: false,
        filterValue: "",
        filterField: undefined,
        filterOptions: ["all", "open_access"],
        showDropdownSort: true,
        sortValue: "relevance",
        sortOptions: ["relevance", "year"],
        isContentBased: true,
        baseUnit: "questions",
        showKeywords: true,
        showDocumentType: true,
        showMetrics: false,
        noCitationDoctypes: [],
        ...overrideListObject,
      },
      query: {
        text: "test query",
        parsedTerms: ["test", "query"],
        highlightTerms: true,
      },
      misc: {
        renderMap: true,
        renderList: true,
      },
      tracking: {},
      selectedBubble: undefined,
      selectedPaper: undefined,
      chartType: KNOWLEDGEMAP_MODE,
      service: "none",
      localization: localization,
    },
    overrideStoreObject,
  );

  return storeObject;
};

describe("List entries component", () => {
  it("renders shown", () => {
    const storeObject = setup({}, { show: true });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders hidden", () => {
    const storeObject = setup({}, { show: false });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).toBe(null);
  });

  it("renders with pubmed data", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
      },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by open_access", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "open_access",
      },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by publication", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "publication",
      },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by dataset", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "dataset",
      },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data", () => {
    const storeObject = setup(
      { list: localData },
      { show: true },
      { service: null },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data and set height", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, height: 800 },
      { service: null },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(
      result.container.querySelector("#papers_list").getAttribute("style"),
    ).toContain("height");
  });

  it("renders with local data sorted by year", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, sortValue: "year" },
      { service: null },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data sorted by readers", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, sortValue: "readers" },
      { service: null },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data and selected paper", () => {
    const storeObject = setup(
      { list: localData },
      { show: true },
      {
        service: null,
        selectedBubble: {
          uri: localData[0].area_uri,
        },
        selectedPaper: {
          safeId: localData[0].safe_id,
        },
      },
    );
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>,
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  describe("events", () => {
    it("triggers a correct title click action in pubmed", () => {
      const EXPECTED_PAYLOAD = [zoomIn().type];
      const storeObject = setup({ show: true }, { service: "pubmed" });
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
      );

      const title = result.container.querySelector(".list_title");
      fireEvent.click(title);

      const actions = store.getActions();

      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("renders with data without title, authors and abstract", () => {
      const storeObject = setup(
        {
          list: [
            {
              id: "https://doi.org/10.1038/nrmicro2090",
              title: "",
              authors: "",
              paper_abstract: "",
              url: "https://doi.org/10.1038/nrmicro2090",
              readers: 0,
              subject_orig: "Spike protein, vaccines",
              keywords: "Spike protein, vaccines",
              subject: "Spike protein, vaccines",
              oa_state: 3,
              link: "https://www.nature.com/articles/nrmicro2090.pdf",
              list_link: {
                address: "https://www.nature.com/articles/nrmicro2090.pdf",
                isDoi: false,
              },
              relevance: 3,
              comments: [],
              tags: ["Peer-reviewed"],
              resulttype: ["Review"],
              area_uri: 0,
              area: "Vaccines",
              authors_string: "",
              authors_short_string: "",
              safe_id:
                "https__003a__002f__002fdoi__002eorg__002f10__002e1038__002fnrmicro2090",
              num_readers: 0,
              internal_readers: 1,
              num_subentries: 0,
              paper_selected: false,
              oa: false,
              free_access: true,
              oa_link: "https://www.nature.com/articles/nrmicro2090.pdf",
              outlink: "https://doi.org/10.1038/nrmicro2090",
              year: "2020",
            },
          ],
        },
        {
          show: true,
          showFilter: true,
          filterField: "resulttype",
          filterValue: "all",
        },
      );
      const store = mockStore(storeObject);

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
      );

      expect(
        result.container.querySelector("#paper_list_title").textContent,
      ).toEqual(`${storeObject.localization.default_paper_title} (2020)`);
      expect(
        result.container.querySelector(".list_authors").textContent,
      ).toEqual(storeObject.localization.default_authors);
      expect(
        result.container.querySelector("#list_abstract").textContent,
      ).toEqual(storeObject.localization.default_abstract);
    });
  });
});
