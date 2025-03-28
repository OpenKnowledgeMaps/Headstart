import { expect, describe, it, vitest } from 'vitest';

import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import configureStore from "redux-mock-store";

import Footer from "../../js/components/Footer";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);
const setup = (overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      service: "base",
      misc: {
        timestamp: "2020-07-09 18:20:14",
      },
      modals: {
        FAQsUrl: "https://example.com",
      },
      localization: {},
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("Footer component", () => {
  it("doesn't render on made-up data integration", () => {
    const storeObject = setup({ service: "something-random" });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={storeObject.localization}>
          <Footer />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector("#builtwith")).toBeNull();
  });

  it("doesn't render on null data integration", () => {
    const storeObject = setup({ service: null });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={storeObject.localization}>
          <Footer />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector("#builtwith")).toBeNull();
  });

  it("renders correctly in BASE", () => {
    const storeObject = setup({ service: "base" });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={storeObject.localization}>
          <Footer />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector("#builtwith").textContent.trim()).toEqual(
      "This visualization was created by Open Knowledge Maps on 9 Jul 2020 at 18:20. For more information read our FAQs."
    );
  });

  it("renders correctly without timestamp", () => {
    const storeObject = setup({ service: "pubmed", misc: { timestamp: null } });
    const store = mockStore(storeObject);

    const result = render(
      <Provider store={store}>
        <LocalizationProvider localization={storeObject.localization}>
          <Footer />
        </LocalizationProvider>
      </Provider>
    );

    expect(result.container.querySelector("#builtwith").textContent.trim()).toEqual(
      "This visualization was created by Open Knowledge Maps. For more information read our FAQs."
    );
  });
});
