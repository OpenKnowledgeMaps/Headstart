import { expect, describe, it } from 'vitest';

import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import configureStore from "redux-mock-store";


import KnowledgeMap from "../../js/components/KnowledgeMap";

import initialTestData, { initialTestAreas } from "../data/simple";
import LocalizationProvider from "../../js/components/LocalizationProvider";


const mockStore = configureStore([]);
const setup = (overrideStoreObject = {}) => {
  // TODO test all undefined things
  const storeObject = Object.assign(
    {
      zoom: false,
      selectedBubble: undefined,
      highlightedBubble: undefined,
      selectedPaper: undefined,
      data: {
        list: initialTestData,
      },
      areas: {
        list: initialTestAreas,
      },
      chart: {
        width: 800,
        height: 800,
      },
      animation: null,
      bubbleOrder: {
        hoveredBubble: null,
        order: [],
      },
      paperOrder: {
        hoveredPaper: null,
        order: [],
        enlargeFactor: 1.5,
      },
      query: {
        text: "",
        parsedTerms: [],
        highlightTerms: false,
      },
      list: {
        searchValue: "",
        filterValue: undefined,
        filterField: undefined,
        isContentBased: false,
        baseUnit: undefined,
      },
      tracking: {},
      localization: {},
      toolbar: {},
      paper: {},
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("Knowledge map component", () => {
  it("renders zoomed out", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);
    const localization = {}
      
    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={localization}>
          <KnowledgeMap />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector("#chart-svg")).not.toBe(null);
  });

  it("renders zoomed in", () => {
    const storeObject = setup({
      zoom: true,
      selectedBubble: {
        title: initialTestAreas[0].title,
        uri: initialTestAreas[0].area_uri,
      },
    });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <KnowledgeMap />
      </Provider>
    );

    expect(result.container.querySelector("#chart-svg")).not.toBe(null);
  });

  /*
  describe("search box", () => {
    it("renders with correct value", () => {
      const SEARCH_TEXT = "some text";
      const storeObject = setup({ searchValue: SEARCH_TEXT });
      const store = mockStore(storeObject);

        const result = render(
          <Provider store={store}>
            <FilterSort />
          </Provider>,
          container
        );

      expect(
        result.container.querySelector("#filter_input").getAttribute("value")
      ).toEqual(SEARCH_TEXT);
    });
  });
  */
});
