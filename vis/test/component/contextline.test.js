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
        articlesCount: 100, // context.num_documents
        modifier: null, // context.params.sorting => most-recent || most-relevant
        showModifierPopover: false, // context.params.sorting === "most-relevant" && config.context_most_relevant_tooltip
        openAccessCount: null, // config.show_context_oa_number => context.share_oa
        showAuthor: false, // config.is_authorview && context.params.author_id
        author: {
          id: null, // context.params.author_id
          livingDates: null, // context.params.living_dates
        },
      },
      localization: {
        most_recent_label: "most recent",
        most_relevant_label: "most relevant",
        most_relevant_tooltip: "Sample most relevant tooltip",
        articles_label: "Sample articles label",
        bio_link: "Sample author bio link"
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

  it("is hidden", () => {
    const store = mockStore(setup({ zoom: true }));
    act(() => {
      render(<ContextLine store={store} />, container);
    });

    expect(container.childNodes.length).toBe(0);
  });


  // TODO doctype tests

  // TODO the rest


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
        livingDates: "1799-1864"
      }
      const storeObject = setup();
      storeObject.contextLine.showAuthor = SHOW_AUTHOR;
      storeObject.contextLine.author = AUTHOR;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#author_living_dates").textContent).toEqual(AUTHOR.livingDates);
    });

    it("contains correct bio link", () => {
      const SHOW_AUTHOR = true;
      const AUTHOR = {
        id: "some_id",
        livingDates: "1799-1864"
      }
      const storeObject = setup();
      storeObject.contextLine.showAuthor = SHOW_AUTHOR;
      storeObject.contextLine.author = AUTHOR;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#author_bio_link").getAttribute("href")).toEqual("https://d-nb.info/gnd/" + AUTHOR.id);
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

      expect(container.querySelector("#num_articles").textContent).toMatch(new RegExp(`^${ARTICLES_COUNT}`));
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

      expect(container.querySelector("#modifier").textContent).toEqual(storeObject.localization.most_recent_label);
    });

    it("contains a correct modifier label (most relevant)", () => {
      const MODIFIER = "most-relevant";
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#modifier").textContent).toEqual(storeObject.localization.most_relevant_label);
    });

    it("contains a correct modifier popover content (most relevant)", () => {
      const MODIFIER = "most-relevant";
      const SHOW_POPOVER = true;
      const storeObject = setup();
      storeObject.contextLine.modifier = MODIFIER;
      storeObject.contextLine.showModifierPopover = SHOW_POPOVER;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#modifier").classList).toContain("context_moreinfo");
      expect(container.querySelector("#modifier").getAttribute("data-content")).toEqual(storeObject.localization.most_relevant_tooltip);
    });

    it("contains a number of open access articles", () => {
      const OPEN_ACCESS_COUNT = 12;
      const storeObject = setup();
      storeObject.contextLine.openAccessCount = OPEN_ACCESS_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#num_articles").textContent).toMatch(new RegExp(`\\(${OPEN_ACCESS_COUNT} open access\\)$`));
    });

    it("doesn't contain a number of open access articles", () => {
      const OPEN_ACCESS_COUNT = null;
      const storeObject = setup();
      storeObject.contextLine.openAccessCount = OPEN_ACCESS_COUNT;

      const store = mockStore(storeObject);

      act(() => {
        render(<ContextLine store={store} />, container);
      });

      expect(container.querySelector("#num_articles").textContent).not.toMatch(new RegExp(`open access\\)$`));
    });
  });
});
