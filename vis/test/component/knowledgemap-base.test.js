import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { render, unmountComponentAtNode } from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import {
  initializeStore,
  hoverBubble,
  applyForceAreas,
  applyForcePapers,
  zoomIn,
  selectPaper,
  hoverPaper,
} from "../../js/actions";
import reducer from "../../js/reducers";

import KnowledgeMap from "../../js/components/KnowledgeMap";

import data, {
  areas,
  baseConfig as config,
  baseContext as context,
} from "../data/base";

import { applyForce } from "../../js/utils/force";

const FORCE_LAYOUT_PARAMS = {
  areasAlpha: config.area_force_alpha,
  isForceAreas: config.is_force_areas,
  papersAlpha: config.papers_force_alpha,
  isForcePapers: config.is_force_papers,
};

const setup = () => {
  const store = createStore(reducer);
  store.dispatch(
    initializeStore(config, context, data, areas, null, 500, null, null, 500, {
      bubbleMinScale: config.bubble_min_scale,
      bubbleMaxScale: config.bubble_max_scale,
      paperMinScale: config.paper_min_scale,
      paperMaxScale: config.paper_max_scale,
    })
  );
  const state = store.getState();

  applyForce(
    state.areas.list,
    state.data.list,
    state.chart.width,
    (newAreas) => store.dispatch(applyForceAreas(newAreas, state.chart.height)),
    (newPapers) =>
      store.dispatch(applyForcePapers(newPapers, state.chart.height)),
    FORCE_LAYOUT_PARAMS
  );

  return store;
};

const mockStore = configureStore([]);

/**
 * Extra test suite for testing BASE data integration on real data, config and context.
 *
 * This file tests only the interactions. The structure is tested by snapshot test.
 */
describe("Knowledge map component - special BASE tests", () => {
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
    const realStore = setup();
    const store = mockStore(realStore.getState());

    act(() => {
      render(
        <Provider store={store}>
          <KnowledgeMap />
        </Provider>,
        container
      );
    });

    expect(container.querySelector("#chart-svg")).not.toBe(null);
  });

  it("renders with a paper order and a hovered paper", () => {
    const realStore = setup();
    const state = { ...realStore.getState() };
    state.zoom = true;
    const bubble = state.areas.list[0];
    state.selectedBubble = {
      uri: bubble.area_uri,
    };
    state.paperOrder = {
      hoveredPaper: bubble.papers[0].safe_id,
      order: [bubble.papers[1].safe_id, bubble.papers[0].safe_id],
      enlargeFactor: 125,
    };
    const store = mockStore(state);

    act(() => {
      render(
        <Provider store={store}>
          <KnowledgeMap />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".larger")).not.toBe(null);
  });

  it("renders with a highlighted bubble", () => {
    const realStore = setup();
    const state = { ...realStore.getState() };
    state.highlightedBubble = state.areas.list[0].area_uri;
    const store = mockStore(state);

    act(() => {
      render(
        <Provider store={store}>
          <KnowledgeMap />
        </Provider>,
        container
      );
    });

    expect(container.querySelector(".highlight-bubble")).not.toBe(null);
  });

  describe("events", () => {
    it("triggers a correct zoomed out bubble mouseover action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const bubble = container.querySelector(".bubble_frame");
      act(() => {
        ReactTestUtils.Simulate.mouseOver(bubble);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [hoverBubble().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct zoomed out bubble mouseover action when the bubble already hovered", () => {
      const realStore = setup();
      realStore.dispatch(hoverBubble(3));
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const allBubbles = container.querySelectorAll(".bubble_frame");
      act(() => {
        ReactTestUtils.Simulate.mouseOver(allBubbles[allBubbles.length - 1]);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [];
      expect(actions).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct zoomed out bubble mouseclick action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const bubble = container.querySelector(".bubble_frame");
      act(() => {
        ReactTestUtils.Simulate.click(bubble);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct zoomed in bubble another bubble mouseclick action", () => {
      const realStore = setup();
      const state = { ...realStore.getState() };
      state.zoom = true;
      state.selectedBubble = {
        uri: state.areas.list[1].area_uri,
      };
      const store = mockStore(state);

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const bubble = container.querySelector(".bubble_frame");
      act(() => {
        ReactTestUtils.Simulate.click(bubble);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("triggers a correct zoomed out paper mouseclick action", () => {
      const realStore = setup();
      const store = mockStore(realStore.getState());

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const paper = container.querySelector(".paper");
      act(() => {
        ReactTestUtils.Simulate.click(paper);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [zoomIn().type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("hovers a paper in a zoomed in bubble", () => {
      const realStore = setup();
      const state = { ...realStore.getState() };
      state.zoom = true;
      state.selectedBubble = {
        uri: state.areas.list[0].area_uri,
      };
      const store = mockStore(state);

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const papers = container.querySelectorAll(".paper");
      act(() => {
        ReactTestUtils.Simulate.mouseOver(papers[papers.length - 1]);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [hoverPaper({}).type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("leaves a paper in a zoomed in bubble", () => {
      const realStore = setup();
      const state = { ...realStore.getState() };
      state.zoom = true;
      state.selectedBubble = {
        uri: state.areas.list[0].area_uri,
      };
      const store = mockStore(state);

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const papers = container.querySelectorAll(".paper");
      act(() => {
        ReactTestUtils.Simulate.mouseOut(papers[papers.length - 1]);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [hoverPaper({}).type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("selects a paper in a zoomed in bubble", () => {
      const realStore = setup();
      const state = { ...realStore.getState() };
      state.zoom = true;
      state.selectedBubble = {
        uri: state.areas.list[0].area_uri,
      };
      const store = mockStore(state);

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const papers = container.querySelectorAll(".paper");
      act(() => {
        ReactTestUtils.Simulate.click(papers[papers.length - 1]);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [selectPaper({}).type];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });

    it("selects an already selected paper in a zoomed in bubble", () => {
      const realStore = setup();
      const state = { ...realStore.getState() };
      state.zoom = true;
      const bubble = state.areas.list.find((a) => a.papers.length > 0);
      state.selectedBubble = {
        uri: bubble.area_uri,
      };
      state.selectedPaper = {
        safeId: bubble.papers[2].safe_id,
      };
      const store = mockStore(state);

      act(() => {
        render(
          <Provider store={store}>
            <KnowledgeMap />
          </Provider>,
          container
        );
      });

      const papers = container.querySelectorAll(".paper");
      act(() => {
        ReactTestUtils.Simulate.click(papers[papers.length - 1]);
      });

      const actions = store.getActions();

      const EXPECTED_PAYLOAD = [];
      expect(actions.map((a) => a.type)).toEqual(EXPECTED_PAYLOAD);
    });
  });
});
