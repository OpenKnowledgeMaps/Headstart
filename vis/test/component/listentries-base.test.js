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

import ListEntries from "../../js/components/ListEntries";

import { selectPaper, zoomIn, hoverArea, showPreview } from "../../js/actions";
import reducer from "../../js/reducers";

const setup = () => {
  const store = createStore(reducer);
  store.dispatch(initializeStore(config, context, data));

  return store;
};

const mockStore = configureStore([]);

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
          <ListEntries />
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

    it("triggers a correct title click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <ListEntries />
          </Provider>,
          container
        );
      });

      const title = container.querySelector(".list_title");
      act(() => {
        ReactTestUtils.Simulate.click(title);
      });

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.find(
          (p) =>
            p.id ===
            "15e63fc6c5dfa228a39433f46c271946c8cf45f566bb63036ed89f66ce66a5e7"
        );

      const EXPECTED_PAYLOAD = selectPaper(firstPaper);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <ListEntries />
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.click(area);
      });

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.find(
          (p) =>
            p.id ===
            "15e63fc6c5dfa228a39433f46c271946c8cf45f566bb63036ed89f66ce66a5e7"
        );

      const EXPECTED_PAYLOAD = zoomIn(
        { title: firstPaper.area, uri: firstPaper.area_uri },
        "list-area"
      );
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseover action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <ListEntries />
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
        .data.find(
          (p) =>
            p.id ===
            "15e63fc6c5dfa228a39433f46c271946c8cf45f566bb63036ed89f66ce66a5e7"
        );

      const EXPECTED_PAYLOAD = hoverArea(firstPaper);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct area mouseout action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <ListEntries />
          </Provider>,
          container
        );
      });

      const area = container.querySelector("#list_area");
      act(() => {
        ReactTestUtils.Simulate.mouseOut(area);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = hoverArea(null);
      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });

    it("triggers a correct pdf preview click action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <ListEntries />
          </Provider>,
          container
        );
      });

      const pdfPreview = container.querySelector(".link2.oa-link");
      act(() => {
        ReactTestUtils.Simulate.click(pdfPreview);
      });

      const actions = store.getActions();

      const firstPaper = realStore
        .getState()
        .data.find(
          (p) =>
            p.id ===
            "008ea92dafd41bdb55abf7cb8b4f43deb52ac003a2b15a8c5eb8743ae021533d"
        );
      const EXPECTED_PAYLOAD = showPreview(firstPaper);

      expect(actions).toEqual([EXPECTED_PAYLOAD]);
    });
  });
});
