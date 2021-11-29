import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { render, unmountComponentAtNode } from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import data, {
  baseConfig as config,
  baseContext as context,
} from "../data/base";
import { initializeStore } from "../../js/actions";

import List from "../../js/components/List";

import {
  zoomIn,
  highlightArea,
  showPreview,
  search,
  filter,
  sort,
} from "../../js/actions";
import reducer from "../../js/reducers";
import LocalizationProvider from "../../js/components/LocalizationProvider";
import { getAuthorsList } from "../../js/utils/data";

const setup = () => {
  data.forEach((d) => (d.authors_list = getAuthorsList(d.authors, true)));

  const store = createStore(reducer);
  store.dispatch(
    initializeStore(config, context, data, null, 800, null, null, 800, {
      bubbleMinScale: config.bubble_min_scale,
      bubbleMaxScale: config.bubble_max_scale,
      paperMinScale: config.paper_min_scale,
      paperMaxScale: config.paper_max_scale,
    })
  );

  return store;
};

const mockStore = configureStore([]);

const localization = config.localization.eng_pubmed;

/**
 * Extra test suite for testing BASE data integration on real data, config and context.
 *
 * This file tests only the interactions. The structure is tested by snapshot test.
 */
describe("List entries component - special BASE tests", () => {
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

  it("renders", () => {
    const store = setup();

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
    it("triggers a correct title click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

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

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

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

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area mouseover action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

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

      const firstPaper = realStore
        .getState()
        .data.list.find(
          (p) =>
            p.id ===
            "15e63fc6c5dfa228a39433f46c271946c8cf45f566bb63036ed89f66ce66a5e7"
        );

      const EXPECTED_PAYLOAD = highlightArea(firstPaper);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseout action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

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

      const EXPECTED_PAYLOAD = highlightArea(null);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct pdf preview click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

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

      const pdfPreview = container.querySelector(".paper_button");
      act(() => {
        ReactTestUtils.Simulate.click(pdfPreview);
      });

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.list.find(
          (p) =>
            p.id ===
            "008ea92dafd41bdb55abf7cb8b4f43deb52ac003a2b15a8c5eb8743ae021533d"
        );
      const EXPECTED_PAYLOAD = showPreview(firstPaper);

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });

  describe("search, filter and sort", () => {
    it("searches the list for 'sustainability education'", () => {
      const store = setup();

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

      act(() => {
        store.dispatch(search("sustainability education"));
      });

      const papers = container.querySelectorAll(".list_entry");

      expect(papers.length).toEqual(2);
    });

    it("filters the list for open access papers only", () => {
      const store = setup();

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

      act(() => {
        store.dispatch(filter("open_access"));
      });

      const papers = container.querySelectorAll(".list_entry");

      expect(papers.length).toEqual(10);
    });

    it("sorts the list by year", () => {
      const store = setup();

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

      act(() => {
        store.dispatch(sort("year"));
      });

      const papers = container.querySelectorAll(".list_entry");

      const regexp = /\((?<year>\d{4})/;

      let years = [...papers]
        .map((e) => e.querySelector(".list_title").textContent)
        .map((y) => {
          const found = y.match(regexp);
          return parseInt(found.groups.year);
        });

      expect(years).toEqual([
        2020, 2019, 2019, 2019, 2019, 2019, 2018, 2018, 2018, 2017, 2016, 2014,
        2014, 2014, 2013, 2012, 2011, 2010, 2008, 2007,
      ]);
    });

    it("searches, filters and sorts at the same time", () => {
      const store = setup();

      const SEARCH_TEXT = "Online Education";

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

      act(() => {
        store.dispatch(search(SEARCH_TEXT));
      });

      let papers = container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(3);

      act(() => {
        store.dispatch(filter("open_access"));
      });

      papers = container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(2);

      act(() => {
        store.dispatch(sort("title"));
      });

      papers = container.querySelectorAll(".list_entry");

      let titles = [...papers].map(
        (e) => e.querySelector(".list_title").textContent
      );

      expect(titles).toEqual([
        "Digital Education And Learning: The Growing Trend In Academic And Business Spaces—An International Overview (2018)",
        "Integrating Digital Libraries into Distance Education: A Review of Models, Roles, And Strategies (2019-04-01)",
      ]);
    });
  });
});
