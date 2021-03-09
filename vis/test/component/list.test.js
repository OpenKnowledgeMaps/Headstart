import React from "react";
import { Provider } from "react-redux";
import { render, unmountComponentAtNode } from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import {
  KNOWLEDGEMAP_MODE,
  STREAMGRAPH_MODE,
} from "../../js/reducers/chartType";

import defaultConfig from "../../js/default-config";

import {
  zoomIn,
  selectPaper,
  highlightArea,
  deselectPaperBacklink,
  showPreview,
  deselectPaper,
} from "../../js/actions";

import initialTestData from "../data/simple";
import covisData from "../data/covis";
import linkedcatData from "../data/linkedcat-streamgraph";
import localData from "../data/local-files";
import pubmedData from "../data/pubmed";
import viperData from "../data/viper";

import List from "../../js/components/List";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const localization = defaultConfig.localization.eng;

const mockStore = configureStore([]);
const setup = (
  overrideDataObject = {},
  overrideListObject = {},
  overrideStoreObject = {}
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
        abstractSize: 250,
        isContentBased: true,
        baseUnit: "questions",
        showRealPreviewImage: false,
        linkType: "covis",
        showKeywords: true,
        showDocumentType: true,
        showMetrics: false,
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
      selectedBubble: undefined,
      selectedPaper: undefined,
      chartType: KNOWLEDGEMAP_MODE,
      service: "none",
      localization: localization,
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("List entries component", () => {
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

  it("renders shown", () => {
    const storeObject = setup({}, { show: true });
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders hidden", () => {
    const storeObject = setup({}, { show: false });
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).toBe(null);
  });

  it("renders with covis data", () => {
    const storeObject = setup(
      { list: covisData },
      {
        show: true,
        showFilter: true,
        filterField: "resulttype",
        filterValue: "all",
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and height", () => {
    const storeObject = setup(
      { list: covisData },
      {
        show: true,
        showFilter: true,
        filterField: "resulttype",
        filterValue: "all",
        height: 800,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(
      container.querySelector("#papers_list").getAttribute("style")
    ).toContain("height");
  });

  it("renders with covis data and zoomed", () => {
    const storeObject = setup(
      { list: covisData },
      { show: true, showFilter: true },
      {
        zoom: true,
        selectedBubble: {
          title: "Host biology and clinical findings",
          uri: 2,
          // color can only happen in triple streamgraph, not in covis
          color: "green",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and a selected paper", () => {
    const storeObject = setup(
      { list: covisData },
      { show: true, showFilter: true },
      {
        zoom: true,
        selectedBubble: {
          title: "Host biology and clinical findings",
          uri: 2,
        },
        selectedPaper: {
          safeId:
            "https__003a__002f__002frefigure__002eorg__002fcollections__002fitem__002fecd1dab0__002d56a5__002d11ea__002d8c54__002d9323bc73fc6b__002f",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and a selected paper (open access)", () => {
    const storeObject = setup(
      { list: covisData },
      { show: true, showFilter: true },
      {
        zoom: true,
        selectedBubble: {
          title: "Viral biology",
          uri: 1,
        },
        selectedPaper: {
          safeId:
            "https__003a__002f__002fdoi__002eorg__002f10__002e1101__002f2020__002e02__002e10__002e942136-",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data sorted by title", () => {
    const storeObject = setup(
      { list: covisData },
      {
        show: true,
        showFilter: true,
        filterField: "resulttype",
        filterValue: "all",
        sortValue: "title",
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data", () => {
    const storeObject = setup(
      { list: viperData },
      { show: true, showFilter: true, linkType: "url", showMetrics: true }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = citations", () => {
    const storeObject = setup(
      { list: viperData },
      {
        show: true,
        showFilter: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "citations",
        isContentBased: false,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = tweets", () => {
    const storeObject = setup(
      { list: viperData },
      {
        show: true,
        showFilter: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "tweets",
        isContentBased: false,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = readers", () => {
    const storeObject = setup(
      { list: viperData },
      {
        show: true,
        showFilter: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "readers",
        isContentBased: false,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by open_access", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "open_access",
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by publication", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "publication",
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by dataset", () => {
    const storeObject = setup(
      { list: pubmedData },
      {
        show: true,
        showFilter: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "dataset",
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data", () => {
    const storeObject = setup(
      { list: localData },
      { show: true },
      { service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data and set height", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, height: 800 },
      { service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(
      container.querySelector("#papers_list").getAttribute("style")
    ).toContain("height");
  });

  it("renders with local data sorted by year", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, sortValue: "year" },
      { service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data sorted by readers", () => {
    const storeObject = setup(
      { list: localData },
      { show: true, sortValue: "readers" },
      { service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
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
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data and set height", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true, height: 800 },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(
      container.querySelector("#papers_list").getAttribute("style")
    ).toContain("height");
  });

  it("renders with linkedcat streamgraph data, zoomed", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
        zoom: true,
        selectedBubble: {
          title: "Orient",
          color: "red",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data, zoomed and paper selected", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
        zoom: true,
        selectedBubble: {
          title: "Orient",
        },
        selectedPaper: {
          safeId: "AC15093982",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data and paper selected", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
        selectedPaper: {
          safeId: "AC15093982",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data filtered out with search", () => {
    const storeObject = setup(
      { list: linkedcatData },
      { show: true, searchValue: "Selbstbiographie" },
      {
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  describe("events", () => {
    it("triggers a correct title click action in local files", () => {
      const EXPECTED_PAYLOAD = [
        selectPaper(initialTestData[0]).type,
        zoomIn().type,
      ];
      const storeObject = setup({ show: true }, { service: null });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const title = container.querySelector(".list_title");
      act(() => {
        ReactTestUtils.Simulate.click(title);
      });

      const actions = store.getActions();

      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area click action in local files", () => {
      const EXPECTED_PAYLOAD = [deselectPaper().type, zoomIn().type];
      const storeObject = setup({ show: true }, { service: null });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area mouseover action in local files", () => {
      const EXPECTED_PAYLOAD = highlightArea(initialTestData[0]);
      const storeObject = setup({ show: true }, { service: null });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.mouseOver(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseout action in local files", () => {
      const EXPECTED_PAYLOAD = highlightArea(null);
      const storeObject = setup({ show: true }, { service: null });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.mouseOut(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct title click action in linkedcat", () => {
      const EXPECTED_PAYLOAD = selectPaper(linkedcatData[0]);
      const storeObject = setup(
        { list: [linkedcatData[0]] },
        { show: true },
        {
          service: "linkedcat_streamgraph",
          chartType: STREAMGRAPH_MODE,
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const title = container.querySelector(".list_title");
      act(() => {
        ReactTestUtils.Simulate.click(title);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area click action in linkedcat", () => {
      const EXPECTED_PAYLOAD = [deselectPaper().type, zoomIn().type];
      const storeObject = setup(
        { list: [linkedcatData[0]] },
        { show: true },
        {
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area mouseover action in linkedcat", () => {
      const EXPECTED_PAYLOAD = highlightArea(linkedcatData[0]);
      const storeObject = setup(
        { list: [linkedcatData[0]] },
        { show: true },
        {
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.mouseOver(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseout action in linkedcat", () => {
      const EXPECTED_PAYLOAD = highlightArea(null);
      const storeObject = setup(
        { list: [linkedcatData[0]] },
        { show: true },
        {
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.mouseOut(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct backlink click action in linkedcat (zoomed)", () => {
      const PAPER = linkedcatData.find((p) => p.safe_id === "AC15093982");
      const EXPECTED_PAYLOAD = deselectPaperBacklink();
      const storeObject = setup(
        { list: [PAPER] },
        { show: true },
        {
          service: "linkedcat_streamgraph",
          chartType: STREAMGRAPH_MODE,
          localization: defaultConfig.localization.ger_linkedcat,
          zoom: true,
          selectedBubble: {
            title: "Orient",
          },
          selectedPaper: {
            safeId: "AC15093982",
          },
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#backlink_list");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct pdf preview click action in linkedcat", () => {
      const PAPER = linkedcatData.find((p) => p.safe_id === "AC15093982");
      const EXPECTED_PAYLOAD = showPreview(PAPER);
      const storeObject = setup(
        { list: [PAPER] },
        { show: true },
        {
          service: "linkedcat_streamgraph",
          chartType: STREAMGRAPH_MODE,
          localization: defaultConfig.localization.ger_linkedcat,
          zoom: true,
          selectedBubble: {
            title: "Orient",
          },
          selectedPaper: {
            safeId: "AC15093982",
          },
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={localization}>
              <List />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const pdfPreview = container.querySelector(".link2.oa-link");
      act(() => {
        ReactTestUtils.Simulate.click(pdfPreview);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });
});
