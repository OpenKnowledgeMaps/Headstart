import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import Heading, { getHeadingLabel } from "../../js/components/Heading";
import { changeFile } from "../../js/actions";

import { STREAMGRAPH_MODE } from "../../js/reducers/chartType";

const mockStore = configureStore([]);
const setup = (overrideStore = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      query: null, // context.query
      heading: {
        title: "Sample title", // context.params.title
        acronym: "Sample acronym", // context.params.acronym
        projectId: "Sample project id", // context.params.project_id
        presetTitle: null, // config.title
        titleStyle: null, // config.create_title_from_context_style + config.create_title_from_context if true, then = 'standard'
        titleLabelType: "keywordview-knowledgemap", // config.is_authorview + config.is_streamgraph
        customTitle: null, // config.custom_title
        showDropdown: false, // config.show_dropdown
        files: null, // config.files
      },
      localization: {
        area: "Area",
        area_streamgraph: "Schlagwort",
        intro_icon: "++intro icon++",
        intro_label: "Some intro label",
        default_title: "Sample title",
        overview_label: "Overview of",
        streamgraph_authors_label: "Sample streamgraph authors label",
        overview_authors_label: "Sample knowledgemap authors label",
        streamgraph_label: "Sample streamgraph keywords label",
        custom_title_explanation: "Sample explanation",
      },
    },
    overrideStore
  );

  const store = mockStore(storeObject);

  return { store, storeObject };
};

describe("Heading component", () => {
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
   * Basic render test
   */
  it("renders", () => {
    const { store } = setup({ zoom: true });
    act(() => {
      render(<Heading store={store} />, container);
    });

    expect(container.childNodes.length).toBe(1);
  });

  /**
   * Component render tests
   */
  describe("zoomed-in", () => {
    // TODO test not needed with proper localization
    it("renders with correct label", () => {
      const LABEL = "Special Test Label";
      const { storeObject } = setup({
        zoom: true,
        selectedBubble: { title: "Some zoomed title..." },
      });
      storeObject.localization.area = LABEL;
      const store = mockStore(storeObject);

      act(() => {
        render(<Heading store={store} />, container);
      });

      expect(container.querySelector("#area-bold").textContent).toContain(
        LABEL
      );
    });

    it("renders with correct title", () => {
      const TITLE = "Special Test Title";
      const { store } = setup({ zoom: true, selectedBubble: { title: TITLE } });

      act(() => {
        render(<Heading store={store} />, container);
      });

      expect(container.querySelector("#area-not-bold").textContent).toEqual(
        TITLE
      );
    });

    it("renders as streamgraph with correct title", () => {
      const TITLE = "Special Test Title";
      const { store } = setup({
        chartType: STREAMGRAPH_MODE,
        zoom: true,
        selectedBubble: { title: TITLE },
      });

      act(() => {
        render(<Heading store={store} />, container);
      });

      expect(container.querySelector("#area-not-bold").textContent).toEqual(
        TITLE
      );
    });
  });

  describe("zoomed-out", () => {
    describe("basic", () => {
      // TODO test not needed with proper localization
      it("renders with a default title", () => {
        const TITLE = "Special Default Title";
        const { storeObject } = setup();
        storeObject.localization.default_title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(TITLE);
      });

      it("renders with correct title taken from config", () => {
        const TITLE = "Special Test Title";
        const { storeObject } = setup();
        storeObject.heading.presetTitle = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(TITLE);
      });

      // TODO test not needed with proper localization
      it("renders with an infolink label", () => {
        const LABEL = "Special test label";
        const { storeObject } = setup();
        storeObject.heading.presetTitle = "Some title...";
        storeObject.localization.intro_label = LABEL;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("#infolink").textContent).toContain(
          LABEL
        );
      });

      // TODO test not needed with proper localization
      it("renders with an infolink icon", () => {
        const ICON = "ABC";
        const { storeObject } = setup();
        storeObject.heading.presetTitle = "Some title...";
        storeObject.localization.intro_icon = ICON;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("#whatsthis").textContent).toContain(
          ICON
        );
      });
    });

    describe("viper", () => {
      const setupViper = () => {
        const { storeObject } = setup();
        storeObject.heading.titleStyle = "viper";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct title", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupViper();
        storeObject.heading.title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("span.truncated-project-title").textContent
        ).toContain(TITLE);
      });

      it("renders with correct title attribute", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupViper();
        storeObject.heading.title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container
            .querySelector("span.truncated-project-title")
            .getAttribute("title")
        ).toContain(TITLE);
      });

      it("renders with correct acronym", () => {
        const ACRONYM = "Special Test Acronym";

        const { storeObject } = setupViper();
        storeObject.heading.acronym = ACRONYM;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("span.truncated-project-title").textContent
        ).toContain(ACRONYM);
      });

      it("renders without acronym", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupViper();
        storeObject.heading.title = TITLE;
        delete storeObject.heading.acronym;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("span.truncated-project-title").textContent
        ).toEqual(TITLE);
      });

      it("renders with correct project id", () => {
        const ID = 42069;

        const { storeObject } = setupViper();
        storeObject.heading.projectId = ID;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("span.project-id").textContent).toEqual(
          `(${ID})`
        );
      });

      it("renders with correct but long title", () => {
        const TITLE = "Special Test Title".repeat(100);

        const { storeObject } = setupViper();
        storeObject.heading.title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("span.truncated-project-title").textContent
        ).toContain("...");
      });

      it("renders with correct but long title attribute", () => {
        const TITLE = "Special Test Title".repeat(100);

        const { storeObject } = setupViper();
        storeObject.heading.title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container
            .querySelector("span.truncated-project-title")
            .getAttribute("title")
        ).toContain(TITLE);
      });
    });

    describe("linkedcat", () => {
      const setupLinkedcat = (overrideStore) => {
        const { storeObject } = setup();
        storeObject.heading.titleStyle = "linkedcat";
        storeObject.query = "Some query";

        Object.assign(storeObject, overrideStore);

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct streamgraph author label", () => {
        const LABEL = "Special Streamgraph Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.heading.titleLabelType = "authorview-streamgraph";
        storeObject.localization.streamgraph_authors_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct knowledgemap author label", () => {
        const LABEL = "Special Knowledgemap Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.heading.titleLabelType = "authorview-knowledgemap";
        storeObject.localization.overview_authors_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct streamgraph non-author label", () => {
        const LABEL = "Special Streamgraph non-Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.heading.titleLabelType = "keywordview-streamgraph";
        storeObject.localization.streamgraph_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct knowledgemap non-author label", () => {
        const LABEL = "Special Knowledgemap non-Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.heading.titleLabelType = "keywordview-knowledgemap";
        storeObject.localization.overview_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct query", () => {
        const QUERY = "Special Test Query";

        const { store } = setupLinkedcat({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(QUERY);
      });

      it("renders with correct title attribute", () => {
        const QUERY = "Special Test Query";

        const { store } = setupLinkedcat({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });

      it("renders with correct but long title", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { store } = setupLinkedcat({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toContain("...");
      });

      it("renders with correct but long title attribute", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { store } = setupLinkedcat({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });
    });

    describe("custom title", () => {
      const setupCustom = (overrideStore) => {
        const { storeObject } = setup();
        storeObject.heading.titleStyle = "custom";
        storeObject.heading.customTitle = "Some title";
        storeObject.localization.custom_title_explanation = "Some explanation";
        storeObject.query = "Some query";

        Object.assign(storeObject, overrideStore);

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct title", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupCustom();
        storeObject.heading.customTitle = TITLE;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(TITLE);
      });

      it("renders with correct but too long title", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupCustom();
        storeObject.heading.customTitle = TITLE.repeat(100);

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toContain(TITLE);

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toContain("...");
      });

      it("renders with correct explanation", () => {
        const EXPLANATION = "Special Test Explanation";

        const { storeObject } = setupCustom();
        storeObject.localization.custom_title_explanation = EXPLANATION;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toContain(EXPLANATION);
      });

      it("renders with correct query", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { store } = setupCustom({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toContain(QUERY);
      });

      // we might add other escaped characters to the test in future
      it("renders with title that contains &quot;", () => {
        const TITLE = "Special &quot;Test&quot; Title";
        const ESCAPED_TITLE = 'Special "Test" Title';

        const { storeObject } = setupCustom();
        storeObject.heading.customTitle = TITLE;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(ESCAPED_TITLE);
      });
    });

    describe("standard title", () => {
      const setupStandard = (overrideStore) => {
        const { storeObject } = setup(overrideStore);
        storeObject.heading.titleStyle = "standard";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with query as the title", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { store } = setupStandard({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(QUERY);
      });

      it("renders with query as the title's title attribute", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { store } = setupStandard({ query: QUERY });

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });
    });

    describe("additional features", () => {
      const setupFeatures = () => {
        const { storeObject } = setup();
        storeObject.heading.titleStyle = "standard";
        storeObject.query = "Some query";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      const FILES = [
        {
          title: "edu1",
          file: "./data/edu1.csv",
        },
        {
          title: "edu2",
          file: "./data/edu2.csv",
        },
      ];

      it("renders with a dropdown", () => {
        const { storeObject } = setupFeatures();
        storeObject.heading.showDropdown = true;
        storeObject.files = {
          current: 0,
          list: FILES,
        };

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#datasets").querySelectorAll("option").length
        ).toBe(2);

        expect(
          container.querySelector("#datasets").querySelectorAll("option")[0]
            .textContent
        ).toEqual("edu1");

        expect(
          container
            .querySelector("#datasets")
            .querySelectorAll("option")[0]
            .getAttribute("value")
        ).toEqual("0");

        expect(
          container.querySelector("#datasets").querySelectorAll("option")[1]
            .textContent
        ).toEqual("edu2");

        expect(
          container
            .querySelector("#datasets")
            .querySelectorAll("option")[1]
            .getAttribute("value")
        ).toEqual("1");
      });

      it("triggers a correct redux action when dropdown changes", () => {
        global.console = {
          log: jest.fn(),
          warn: jest.fn(),
          error: console.error,
          info: console.info,
          debug: console.debug,
        };

        const { storeObject } = setupFeatures();
        storeObject.heading.showDropdown = true;
        storeObject.files = {
          current: 0,
          list: FILES,
        };

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        const select = document.querySelector("#datasets");
        act(() => {
          const event = new Event("change", { bubbles: true });
          select.dispatchEvent(event);
        });

        const actions = store.getActions();
        const expectedPayload = changeFile(0);

        expect(actions).toEqual([expectedPayload]);
      });

      it("throws error on unknown label type", () => {
        const { storeObject } = setup();
        const LABEL = "label-that-does-not-exist";

        expect(() => getHeadingLabel(LABEL, storeObject.localization)).toThrow(
          Error
        );
      });
    });
  });
});
