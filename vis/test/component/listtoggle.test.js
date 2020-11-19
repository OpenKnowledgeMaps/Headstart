import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import { toggleList } from "../../js/actions";

import ListToggle from "../../js/components/ListToggle";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);
const setup = (overrideListObject = {}, overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      zoom: false,
      data: [],
      list: {
        show: false,
        searchValue: "",
        filterValue: "",
        filterField: "",
        ...overrideListObject,
      },
      localization: {
        show_list: "show list",
        hide_list: "hide list",
        items: "items",
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

const DOCS_NUMBER = 42;

describe("List toggle component", () => {
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
        <LocalizationProvider localization={storeObject.localization}>
          <ListToggle store={store} docsNumber={DOCS_NUMBER} />
        </LocalizationProvider>,
        container
      );
    });

    expect(container.querySelector("#show_hide_label").textContent).toContain(
      storeObject.localization.hide_list
    );
  });

  it("renders hidden", () => {
    const storeObject = setup({ show: false });
    const store = mockStore(storeObject);

    act(() => {
      render(
        <LocalizationProvider localization={storeObject.localization}>
          <ListToggle store={store} docsNumber={DOCS_NUMBER} />
        </LocalizationProvider>,
        container
      );
    });

    expect(container.querySelector("#show_hide_label").textContent).toContain(
      storeObject.localization.show_list
    );
  });

  it("renders with correct document number", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);

    act(() => {
      render(
        <LocalizationProvider localization={storeObject.localization}>
          <ListToggle store={store} docsNumber={DOCS_NUMBER} />
        </LocalizationProvider>,
        container
      );
    });

    expect(container.querySelector("#list_item_count").textContent).toEqual(
      DOCS_NUMBER.toString()
    );
  });

  it("triggers a correct redux action when clicked", () => {
    const EXPECTED_PAYLOAD = toggleList();

    // TODO remove this when warn is removed
    global.console = {
      log: console.log,
      warn: jest.fn(),
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    const storeObject = setup();
    const store = mockStore(storeObject);

    act(() => {
      render(
        <LocalizationProvider localization={storeObject.localization}>
          <ListToggle store={store} docsNumber={DOCS_NUMBER} />
        </LocalizationProvider>,
        container
      );
    });

    // TODO change this for the #show_hide_button
    const toggle = document.querySelector("#show_hide_button_label");
    act(() => {
      const event = new Event("click", { bubbles: true });
      toggle.dispatchEvent(event);
    });

    const actions = store.getActions();

    expect(actions).toEqual([EXPECTED_PAYLOAD]);
  });
});
