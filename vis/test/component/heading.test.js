import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Heading from "../../js/components/Heading";
import testContext from "../testContext";

const mockStore = configureStore([]);
const setup = (overrideStore = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      config: {
        language: "eng",
        localization: {
          eng: {
            area: "Area",
            intro_icon: "++intro icon++",
            intro_label: "Some intro label",
            overview_label: "Overview of",
          },
        },
      },
      context: JSON.parse(JSON.stringify(testContext)),
    },
    overrideStore
  );

  const store = mockStore(storeObject);

  return { store, storeObject };
};

/**
 * All the tests for the Backlink component, including its template, can be found here.
 */
describe("Backlink component", () => {
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

  it("renders without context", () => {
    const { store } = setup({ zoom: true, context: null });
    act(() => {
      render(<Heading store={store} />, container);
    });

    expect(container.childNodes.length).toBe(1);
  });

  /**
   * Component render tests
   */
  describe("zoomed-in", () => {
    it("renders with correct label", () => {
      const LABEL = "Special Test Label";
      const { storeObject } = setup({
        zoom: true,
        selectedBubble: { title: "Some zoomed title..." },
      });
      storeObject.config.localization.eng.area = LABEL;
      const store = mockStore(storeObject);

      act(() => {
        render(<Heading store={store} />, container);
      });

      expect(container.querySelector("#area-bold").textContent).toEqual(LABEL);
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
  });

  describe("zoomed-out", () => {
    describe("basic", () => {
      it("renders with a default title", () => {
        const TITLE = "Special Default Title";
        const { storeObject } = setup();
        storeObject.config.localization[
          storeObject.config.language
        ].default_title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(TITLE);
      });

      it("renders with correct title taken from config", () => {
        const TITLE = "Special Test Title";
        const { storeObject } = setup();
        storeObject.config.title = TITLE;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(TITLE);
      });

      it("renders with an infolink label", () => {
        const LABEL = "Special test label";
        const { storeObject } = setup();
        storeObject.config.title = "Some title...";
        storeObject.config.localization.eng.intro_label = LABEL;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("#infolink").textContent).toContain(
          LABEL
        );
      });

      it("renders with an infolink icon", () => {
        const ICON = "ABC";
        const { storeObject } = setup();
        storeObject.config.title = "Some title...";
        storeObject.config.localization.eng.intro_icon = ICON;
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
        storeObject.config.create_title_from_context_style = "viper";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct title", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupViper();
        storeObject.context.params.title = TITLE;
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
        storeObject.context.params.title = TITLE;
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
        storeObject.context.params.acronym = ACRONYM;
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
        storeObject.context.params.title = TITLE;
        delete storeObject.context.params.acronym;
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
        storeObject.context.params.project_id = ID;
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
        storeObject.context.params.title = TITLE;
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
        storeObject.context.params.title = TITLE;
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
      const setupLinkedcat = () => {
        const { storeObject } = setup();
        storeObject.config.create_title_from_context = true;
        storeObject.config.create_title_from_context_style = "linkedcat";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct streamgraph author label", () => {
        const LABEL = "Special Streamgraph Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.config.is_authorview = true;
        storeObject.config.is_streamgraph = true;
        storeObject.config.localization[
          storeObject.config.language
        ].streamgraph_authors_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct knowledgemap author label", () => {
        const LABEL = "Special Knowledgemap Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.config.is_authorview = true;
        storeObject.config.is_streamgraph = false;
        storeObject.config.localization[
          storeObject.config.language
        ].overview_authors_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct streamgraph non-author label", () => {
        const LABEL = "Special Streamgraph non-Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.config.is_authorview = false;
        storeObject.config.is_streamgraph = true;
        storeObject.config.localization[
          storeObject.config.language
        ].streamgraph_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct knowledgemap non-author label", () => {
        const LABEL = "Special Knowledgemap non-Author Test Label";

        const { storeObject } = setupLinkedcat();
        storeObject.config.is_authorview = false;
        storeObject.config.is_streamgraph = false;
        storeObject.config.localization[
          storeObject.config.language
        ].overview_label = LABEL;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(container.querySelector("h4").textContent).toContain(LABEL);
      });

      it("renders with correct query", () => {
        const QUERY = "Special Test Query";

        const { storeObject } = setupLinkedcat();
        storeObject.context.query = QUERY;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(QUERY);
      });

      it("renders with correct title attribute", () => {
        const QUERY = "Special Test Query";

        const { storeObject } = setupLinkedcat();
        storeObject.context.query = QUERY;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });

      it("renders with correct but long title", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { storeObject } = setupLinkedcat();
        storeObject.context.query = QUERY;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toContain("...");
      });

      it("renders with correct but long title attribute", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { storeObject } = setupLinkedcat();
        storeObject.context.query = QUERY;
        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });
    });

    describe("custom title", () => {
      const setupCustom = () => {
        const { storeObject } = setup();
        storeObject.config.create_title_from_context = true;
        storeObject.config.create_title_from_context_style = "custom";
        storeObject.config.custom_title = "Some title";
        storeObject.config.localization[
          storeObject.config.language
        ].custom_title_explanation = "Some explanation";
        storeObject.context.query = "Some query";

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with correct title", () => {
        const TITLE = "Special Test Title";

        const { storeObject } = setupCustom();
        storeObject.config.custom_title = TITLE;

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
        storeObject.config.custom_title = TITLE.repeat(100);

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
        storeObject.config.localization[
          storeObject.config.language
        ].custom_title_explanation = EXPLANATION;

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

        const { storeObject } = setupCustom();
        storeObject.context.query = QUERY;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toContain(QUERY);
      });
    });

    describe("standard title", () => {
      const setupStandard = () => {
        const { storeObject } = setup();
        storeObject.config.create_title_from_context = true;

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with query as the title", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { storeObject } = setupStandard();
        storeObject.context.query = QUERY;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(QUERY);
      });

      it("renders with query as the title's title attribute", () => {
        const QUERY = "Special Test Query".repeat(100);

        const { storeObject } = setupStandard();
        storeObject.context.query = QUERY;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(QUERY);
      });

      it("renders with escaped query that contains & < > \" ' / ` =", () => {
        const QUERY = "Special Test Query & < > \" ' / ` =";
        const ESCAPED_QUERY =
          "Special Test Query &amp; &lt; &gt; &quot; &#39; &#x2F; &#x60; &#x3D;";

        const { storeObject } = setupStandard();
        storeObject.context.query = QUERY;

        const store = mockStore(storeObject);

        act(() => {
          render(<Heading store={store} />, container);
        });

        expect(
          container.querySelector("#search-term-unique").textContent
        ).toEqual(ESCAPED_QUERY);

        expect(
          container.querySelector("#search-term-unique").getAttribute("title")
        ).toEqual(ESCAPED_QUERY);
      });
    });

    describe("additional features", () => {
      const setupFeatures = () => {
        const { storeObject } = setup();
        storeObject.config.create_title_from_context = true;

        const store = mockStore(storeObject);

        return { store, storeObject };
      };

      it("renders with a dropdown", () => {
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

        const { storeObject } = setupFeatures();
        storeObject.config.show_dropdown = true;
        storeObject.config.files = FILES;

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
        ).toEqual("./data/edu1.csv");

        expect(
          container.querySelector("#datasets").querySelectorAll("option")[1]
            .textContent
        ).toEqual("edu2");

        expect(
          container
            .querySelector("#datasets")
            .querySelectorAll("option")[1]
            .getAttribute("value")
        ).toEqual("./data/edu2.csv");
      });

      // TODO test reactions to dropdown change
    });
  });
});
