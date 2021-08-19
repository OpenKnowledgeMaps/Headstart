import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";

import configureStore from "redux-mock-store";

import {
  closeEmbedModal,
  closeInfoModal,
  closeViperEditModal,
} from "../../js/actions";
import {
  STREAMGRAPH_MODE,
  KNOWLEDGEMAP_MODE,
} from "../../js/reducers/chartType";

import Modals from "../../js/components/Modals";
import LocalizationProvider from "../../js/components/LocalizationProvider";

const mockStore = configureStore([]);
const setup = (overrideModalsObject = {}, overrideStoreObject = {}) => {
  const storeObject = Object.assign(
    {
      chartType: KNOWLEDGEMAP_MODE,
      heading: {
        acronym: null,
      },
      query: {
        text: null,
      },
      modals: {
        showShareButton: true,
        twitterHashtags: "COVID19,science",
        showEmbedButton: true,
        openEmbedModal: false,
        showFAQsButton: true,
        FAQsUrl: "www.example.org",
        showViperEditButton: false,
        openViperEditModal: false,
        viperEditObjID: null,
        showReloadButton: false,
        reloadLastUpdate: null,
        reloadApiProperties: {
          headstartPath: null,
          sheetID: null,
          persistenceBackend: null,
        },
        openInfoModal: false,
        infoParams: {},
        showImagePreview: false,
        showPDFPreview: false,
        previewedPaper: null,
        useViewer: false,
        ...overrideModalsObject,
      },
      service: "base",
      localization: {
        embed_title: "Some embed title",
        viper_edit_title: "Some viper edit title",
        viper_button_desc_label: "some button label",
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("Modals component", () => {
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

  describe("info modal", () => {
    it("base info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "base", query: { text: "digital education" } }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("pubmed info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "pubmed", heading: { customTitle: "test" } }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("viper info modal renders", () => {
      const storeObject = setup(
        {
          openInfoModal: true,
          infoParams: {
            organisations: [
              { url: "test.com", name: "ABC" },
              { url: "example.org", name: "XYZ" },
            ],
          },
        },
        { service: "openaire" }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("triple knowledge map info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "triple_km" }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("triple streamgraph info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "triple_sg", query: { text: "soft skills" } }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("triple streamgraph info modal renders with custom title", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "triple_sg", heading: { customTitle: "sample text" } }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("gsheets info modal renders", () => {
      const storeObject = setup(
        {
          openInfoModal: true,
          infoParams: {
            main_curator_name: "John Doe",
            main_curator_email: "john@doe.com",
            project_name: "John's research",
            project_website: null,
            sheet_id: "xyz123",
          },
        },
        { service: "gsheets" }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "About this knowledge map"
      );
    });

    it("gsheets info modal renders with project website", () => {
      const storeObject = setup(
        {
          openInfoModal: true,
          infoParams: {
            main_curator_name: "John Doe",
            main_curator_email: "john@doe.com",
            project_name: "John's research",
            project_website: "johnswebsite.com",
            sheet_id: "xyz123",
          },
        },
        { service: "gsheets" }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "About this knowledge map"
      );
    });

    it("default knowledge map info modal renders", () => {
      const storeObject = setup({ openInfoModal: true }, { service: "covis" });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("default knowledge map info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "gsheets", isCovis: true, chartType: KNOWLEDGEMAP_MODE }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("default streamgraph info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "linkedcat", chartType: STREAMGRAPH_MODE }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#info-title").textContent).toEqual(
        "What's this?"
      );
    });

    it("triggers a correct redux action when info modal is closed", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "linkedcat", chartType: STREAMGRAPH_MODE }
      );
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector(".modal-header .close");
      act(() => {
        const event = new Event("click", { bubbles: true });
        select.dispatchEvent(event);
      });

      const actions = store.getActions();
      const expectedPayload = closeInfoModal();

      expect(actions).toEqual([expectedPayload]);
    });
  });

  describe("embed modal", () => {
    it("embed modal renders", () => {
      const storeObject = setup({ openEmbedModal: true });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#embed-title").textContent).toEqual(
        storeObject.localization.embed_title
      );
    });

    it("triggers a correct redux action when embed modal is closed", () => {
      const storeObject = setup({ openEmbedModal: true });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector(".modal-header .close");
      act(() => {
        const event = new Event("click", { bubbles: true });
        select.dispatchEvent(event);
      });

      const actions = store.getActions();
      const expectedPayload = closeEmbedModal();

      expect(actions).toEqual([expectedPayload]);
    });
  });

  describe("viper edit modal", () => {
    it("viper edit modal renders", () => {
      const storeObject = setup({
        openViperEditModal: true,
        showViperEditButton: true,
      });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      expect(document.querySelector("#edit-title").textContent).toEqual(
        storeObject.localization.viper_edit_title
      );
    });

    it("triggers a correct redux action when viper edit modal is closed", () => {
      const storeObject = setup({
        openViperEditModal: true,
        showViperEditButton: true,
      });
      const store = mockStore(storeObject);

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );
      });

      const select = document.querySelector(".modal-header .close");
      act(() => {
        const event = new Event("click", { bubbles: true });
        select.dispatchEvent(event);
      });

      const actions = store.getActions();
      const expectedPayload = closeViperEditModal();

      expect(actions).toEqual([expectedPayload]);
    });
  });
});
