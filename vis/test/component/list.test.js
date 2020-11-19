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
  hoverArea,
  deselectPaperBacklink,
  showPreview,
} from "../../js/actions";

import covisData from "../data/covis";
import linkedcatData from "../data/linkedcat-streamgraph";
import localData from "../data/local-files";
import pubmedData from "../data/pubmed";
import viperData from "../data/viper";

import List from "../../js/components/List";

const mockStore = configureStore([]);
const setup = (overrideListObject = {}, overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      data: initialTestData,
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
      selectedBubble: undefined,
      selectedPaper: undefined,
      chartType: KNOWLEDGEMAP_MODE,
      service: "none",
      localization: defaultConfig.localization.eng,
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
    const storeObject = setup({ show: true });
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders hidden", () => {
    const storeObject = setup({ show: false });
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).toBe(null);
  });

  it("renders with covis data", () => {
    const storeObject = setup(
      { show: true, filterField: "resulttype", filterValue: "all" },
      { data: covisData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and height", () => {
    const storeObject = setup(
      { show: true, filterField: "resulttype", filterValue: "all", height: 800 },
      { data: covisData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector("#papers_list").getAttribute("style")).toContain("height");
  });

  it("renders with covis data and zoomed", () => {
    const storeObject = setup(
      { show: true },
      {
        data: covisData,
        zoom: true,
        selectedBubble: {
          title: "Host biology and clinical findings",
          uri: 2,
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and a selected paper", () => {
    const storeObject = setup(
      { show: true },
      {
        data: covisData,
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
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data and a selected paper (open access)", () => {
    const storeObject = setup(
      { show: true },
      {
        data: covisData,
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
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with covis data sorted by title", () => {
    const storeObject = setup(
      {
        show: true,
        filterField: "resulttype",
        filterValue: "all",
        sortValue: "title",
      },
      { data: covisData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data", () => {
    const storeObject = setup(
      { show: true, linkType: "url", showMetrics: true },
      { data: viperData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = citations", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "citations",
        isContentBased: false,
      },
      { data: viperData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = tweets", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "tweets",
        isContentBased: false,
      },
      { data: viperData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with viper data, base unit = readers", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "url",
        showMetrics: true,
        baseUnit: "readers",
        isContentBased: false,
      },
      { data: viperData }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
      },
      {
        data: pubmedData,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by open_access", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "open_access",
      },
      {
        data: pubmedData,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by publication", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "publication",
      },
      {
        data: pubmedData,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with pubmed data filtered by dataset", () => {
    const storeObject = setup(
      {
        show: true,
        linkType: "doi",
        isContentBased: false,
        baseUnit: "citations",
        showMetrics: false,
        filterValue: "dataset",
      },
      {
        data: pubmedData,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data", () => {
    const storeObject = setup(
      { show: true },
      { data: localData, service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data and set height", () => {
    const storeObject = setup(
      { show: true, height: 800 },
      { data: localData, service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector("#papers_list").getAttribute("style")).toContain("height");
  });

  it("renders with local data sorted by year", () => {
    const storeObject = setup(
      { show: true, sortValue: "year" },
      { data: localData, service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data sorted by readers", () => {
    const storeObject = setup(
      { show: true, sortValue: "readers" },
      { data: localData, service: null }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with local data and selected paper", () => {
    const storeObject = setup(
      { show: true },
      {
        data: localData,
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
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data", () => {
    const storeObject = setup(
      { show: true },
      {
        data: linkedcatData,
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data and set height", () => {
    const storeObject = setup(
      { show: true, height: 800 },
      {
        data: linkedcatData,
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector("#papers_list").getAttribute("style")).toContain("height");
  });

  it("renders with linkedcat streamgraph data, zoomed", () => {
    const storeObject = setup(
      { show: true },
      {
        data: linkedcatData,
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
        zoom: true,
        selectedBubble: {
          title: "Orient",
        },
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data, zoomed and paper selected", () => {
    const storeObject = setup(
      { show: true },
      {
        data: linkedcatData,
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
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data and paper selected", () => {
    const storeObject = setup(
      { show: true },
      {
        data: linkedcatData,
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
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  it("renders with linkedcat streamgraph data filtered out with search", () => {
    const storeObject = setup(
      { show: true, searchValue: "Selbstbiographie" },
      {
        data: linkedcatData,
        service: "linkedcat_streamgraph",
        chartType: STREAMGRAPH_MODE,
        localization: defaultConfig.localization.ger_linkedcat,
      }
    );
    const store = mockStore(storeObject);

    act(() => {
      render(
        <Provider store={store}>
          <List />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".list_metadata")).not.toBe(null);
  });

  describe("events", () => {
    global.console = {
      log: console.log,
      warn: jest.fn(),
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    it("triggers a correct title click action in local files", () => {
      const EXPECTED_PAYLOAD = selectPaper(initialTestData[0]);
      const storeObject = setup(
        { show: true },
        { data: initialTestData, service: null }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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

    it("triggers a correct area click action in local files", () => {
      const EXPECTED_PAYLOAD = zoomIn(
        { title: initialTestData[0].area, uri: initialTestData[0].area_uri },
        "list-area"
      );
      const storeObject = setup(
        { show: true },
        { data: initialTestData, service: null }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseover action in local files", () => {
      const EXPECTED_PAYLOAD = hoverArea(initialTestData[0]);
      const storeObject = setup(
        { show: true },
        { data: initialTestData, service: null }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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
      const EXPECTED_PAYLOAD = hoverArea(null);
      const storeObject = setup(
        { show: true },
        { data: initialTestData, service: null }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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
        { show: true },
        {
          data: [linkedcatData[0]],
          service: "linkedcat_streamgraph",
          chartType: STREAMGRAPH_MODE,
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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
      const EXPECTED_PAYLOAD = zoomIn(
        { title: linkedcatData[0].area, uri: linkedcatData[0].area_uri },
        "list-area"
      );
      const storeObject = setup(
        { show: true },
        {
          data: [linkedcatData[0]],
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseover action in linkedcat", () => {
      const EXPECTED_PAYLOAD = hoverArea(linkedcatData[0]);
      const storeObject = setup(
        { show: true },
        {
          data: [linkedcatData[0]],
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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
      const EXPECTED_PAYLOAD = hoverArea(null);
      const storeObject = setup(
        { show: true },
        {
          data: [linkedcatData[0]],
          service: "linkedcat",
          localization: defaultConfig.localization.ger_linkedcat,
        }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <List />
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
        { show: true },
        {
          data: [PAPER],
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
            <List />
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
        { show: true },
        {
          data: [PAPER],
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
            <List />
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

const initialTestData = [
  {
    id: "https://doi.org/10.1038/nrmicro2090",
    title:
      "The spike protein of SARS-CoV — a target for vaccine and therapeutic development",
    authors:
      "Du, Lanying; He, Yuxian; Zhou, Yusen; Liu, Shuwen; Zheng, Bo-Jian; Jiang, Shibo",
    paper_abstract:
      "Severe acute respiratory syndrome (SARS) is a newly emerging infectious disease caused by a novel coronavirus, SARS-coronavirus (SARS-CoV). The SARS-CoV spike (S) protein is composed of two subunits; the S1 subunit contains a receptor-binding domain that engages with the host cell receptor angiotensin-converting enzyme 2 and the S2 subunit mediates fusion between the viral and host cell membranes. The S protein plays key parts in the induction of neutralizing-antibody and T-cell responses, as well as protective immunity, during infection with SARS-CoV. In this Review, we highlight recent advances in the development of vaccines and therapeutics based on the S protein.",
    published_in: "Nature Reviews Microbiology volume 7, pages226–236",
    year: "2020-02-09",
    url: "https://doi.org/10.1038/nrmicro2090",
    readers: 0,
    subject_orig: "Spike protein, vaccines",
    subject: "Spike protein, vaccines",
    oa_state: 3,
    link: "https://www.nature.com/articles/nrmicro2090.pdf",
    relevance: 3,
    comments: [
      {
        comment:
          "The vaccination efforts are focused on the major surface protein of coronavirus called spike protein",
        author: "ReFigure Team",
      },
    ],
    tags: "Peer-reviewed",
    resulttype: "Review",
    lang_detected: "english",
    cluster_labels:
      "Antibody-dependent enhancement, Coronavirus entry, Spike protein",
    x: -339.1506919811518,
    y: 231.9285358243851,
    area_uri: 0,
    area: "Vaccines",
    file_hash: "hashHash",
    authors_string:
      "Lanying Du, Yuxian He, Yusen Zhou, Shuwen Liu, Bo-Jian Zheng, Shibo Jiang",
    authors_short_string: "L. Du, Y. He, Y. Zhou, S. Liu, B. Zheng, S. Jiang",
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
    comments_for_filtering:
      "The vaccination efforts are focused on the major surface protein of coronavirus called spike protein ReFigure Team",
    diameter: 37.33846153846154,
    width: 27.78759700135467,
    height: 37.05012933513956,
    orig_x: "-0.21812406",
    orig_y: "-0.22742917",
    resized: false,
  },
];
