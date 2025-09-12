import { expect, describe, it } from "vitest";
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { fireEvent, render } from "@testing-library/react";
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
    initializeStore(config, context, data, [], null, 800, null, null, 800, {
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

describe("List entries component - special BASE tests", () => {
  it("renders", () => {
    const store = setup();

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <List />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector(".list_metadata")).not.toBe(null);
  });

  describe("events", () => {
    it("triggers a correct title click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      const title = result.container.querySelector(".list_title");
      fireEvent.click(title);

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      const area = result.container.querySelector(".list_area");
      fireEvent.click(area);

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct area mouseover action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      const area = result.container.querySelector(".list_area");
      fireEvent.mouseOver(area);

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.list.find(
          (p) =>
            p.id ===
            "18cabd2db11b6c2f6108b9fb11d07ce9ec55f2b3037f6cac6e1ea00710728958"
        );

      const EXPECTED_PAYLOAD = highlightArea(firstPaper);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseout action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      const area = result.container.querySelector(".list_area");
      fireEvent.mouseOut(area);

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = highlightArea(null);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct pdf preview click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      const pdfPreview = result.container.querySelector(".paper_button");
      fireEvent.click(pdfPreview);

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.list.find(
          (p) =>
            p.id ===
            "18cabd2db11b6c2f6108b9fb11d07ce9ec55f2b3037f6cac6e1ea00710728958"
        );
      const EXPECTED_PAYLOAD = showPreview(firstPaper);

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });

  describe("search, filter and sort", () => {
    it("searches the list for 'calcium homeostasis'", async () => {
      const store = setup();

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      await act(async () => {
        store.dispatch(search("calcium homeostasis"));
      });

      const papers = result.container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(1);
    });

    it("filters the list for open access papers only", async () => {
      const store = setup();

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      await act(async () => {
        store.dispatch(filter("open_access"));
      });

      const papers = result.container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(6);
    });

    it("sorts the list by year", async () => {
      const store = setup();

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      await act(async () => {
        store.dispatch(sort("year"));
      });

      const papers = result.container.querySelectorAll(".list_entry");

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

    it("searches, filters and sorts at the same time", async () => {
      const store = setup();
      const SEARCH_TEXT = "calcium silicate";

      const result = render(
        <Provider store={store}>
          <LocalizationProvider localization={localization}>
            <List />
          </LocalizationProvider>
        </Provider>
      );

      await act(async () => {
        store.dispatch(search(SEARCH_TEXT));
      });

      let papers = result.container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(4);

      await act(async () => {
        store.dispatch(filter("open_access"));
      });

      papers = result.container.querySelectorAll(".list_entry");
      expect(papers.length).toEqual(2);

      await act(async () => {
        store.dispatch(sort("title"));
      });

      papers = result.container.querySelectorAll(".list_entry");

      let titles = [...papers].map(
        (e) => e.querySelector(".list_title").textContent
      );

      expect(titles).toEqual([
        "Efficacy of different calcium silicate materials as pulp-capping agents: Randomized clinical trial (2019)",
        "Erosion and weathering of the Northern Apennines with implications for the tectonics and kinematics of the orogen (2008)",
      ]);
    });
  });
});
