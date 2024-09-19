import { expect, describe, it, vitest } from 'vitest';
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { toggleList } from "../../js/actions";

import ListToggle from "../../js/templates/ListToggle";
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
  it("renders shown", () => {
    const storeObject = setup({ show: true });
    const store = mockStore(storeObject);

    const result = render(
      <LocalizationProvider localization={storeObject.localization}>
        <ListToggle store={store} docsNumber={DOCS_NUMBER} />
      </LocalizationProvider>
    );

    expect(result.container.querySelector("#show_hide_label").textContent).toContain(
      "Overview (42 documents)"
    );
  });

  it("renders hidden", () => {
    const storeObject = setup({ show: false });
    const store = mockStore(storeObject);

    const result = render(
      <LocalizationProvider localization={storeObject.localization}>
        <ListToggle store={store} docsNumber={DOCS_NUMBER} />
      </LocalizationProvider>
    );

    expect(result.container.querySelector("#show_hide_label").textContent).toContain(
      "Overview (42 documents)"
    );
  });

  it("renders with correct document number", () => {
    const storeObject = setup();
    const store = mockStore(storeObject);

    const result = render(
      <LocalizationProvider localization={storeObject.localization}>
        <ListToggle store={store} docsNumber={DOCS_NUMBER} />
      </LocalizationProvider>
    );

    expect(result.container.querySelector("#list_item_count").textContent).toEqual(
      DOCS_NUMBER.toString()
    );
  });

  it("triggers a correct redux action when clicked", () => {
    const EXPECTED_PAYLOAD = toggleList();

    const storeObject = setup();
    const store = mockStore(storeObject);

    const result = render(
      <LocalizationProvider localization={storeObject.localization}>
        <ListToggle store={store} docsNumber={DOCS_NUMBER} />
      </LocalizationProvider>
    );

    const toggle = result.container.querySelector("#show_hide_button");
    fireEvent.click(toggle);

    const actions = store.getActions();

    expect(actions).toEqual([EXPECTED_PAYLOAD]);
  });
});
