import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";

import configureStore from "redux-mock-store";

import {
  closeCitationModal,
  closeEmbedModal,
  closeInfoModal,
  closeViperEditModal,
  hideCitePaper,
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
        text: "sample query",
      },
      misc: {
        timestamp: "2020-07-09 18:20:14",
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
        showCitationButton: true,
        openCitationModal: false,
        ...overrideModalsObject,
      },
      service: "base",
      localization: {
        embed_title: "Some embed title",
        viper_edit_title: "Some viper edit title",
        viper_button_desc_label: "some button label",
        cite: "Cite",
        cite_title_km: "Cite this knowledge map",
        cite_title_sg: "Cite this streamgraph",
        citation_template:
          "Open Knowledge Maps (${year}). Overview of research on ${query}. Retrieved from ${source} [${date}].",
        cite_vis_km: "Please cite this knowledge map as follows",
        cite_vis_sg: "Please cite this streamgraph as follows",
        copied_button_text: "Copied",
        cite_paper: "Cite this paper",
      },
    },
    overrideStoreObject
  );

  return storeObject;
};

describe("Modals component", () => {
  jest.useFakeTimers().setSystemTime(new Date("2021-01-01").getTime());

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

  describe("map citation modal", () => {
    it("base citation modal renders", () => {
      const storeObject = setup(
        { openCitationModal: true },
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

      expect(document.querySelector("#cite-title").textContent).toEqual(
        "Cite this knowledge map"
      );

      expect(document.querySelector(".citation").textContent).toEqual(
        "Open Knowledge Maps (2021). Overview of research on digital education. Retrieved from http://localhost/ [9 Jul 2020]."
      );
    });

    it("citation modal with long query renders", () => {
      const storeObject = setup(
        { openCitationModal: true },
        { service: "base", query: { text: "digital education ".repeat(10) } }
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

      expect(document.querySelector(".citation").textContent).toEqual(
        "Open Knowledge Maps (2021). Overview of research on digital education digital education digital education digital education digital education digital ed[..]. Retrieved from http://localhost/ [9 Jul 2020]."
      );
    });

    it("citation modal with custom title renders", () => {
      const storeObject = setup(
        { openCitationModal: true },
        {
          service: "base",
          query: { text: "digital education" },
          heading: { titleStyle: "custom", customTitle: "sample title" },
        }
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

      expect(document.querySelector(".citation").textContent).toEqual(
        "Open Knowledge Maps (2021). Overview of research on sample title. Retrieved from http://localhost/ [9 Jul 2020]."
      );
    });

    it("citation modal without timestamp renders", () => {
      const storeObject = setup(
        { openCitationModal: true },
        {
          service: "base",
          query: { text: "digital education" },
          misc: { timestamp: null },
        }
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

      expect(document.querySelector(".citation").textContent).toEqual(
        "Open Knowledge Maps (2021). Overview of research on digital education. Retrieved from http://localhost/."
      );
    });

    it("copies the citation to clipboard when Copy is clicked", async () => {
      const storeObject = setup(
        { openCitationModal: true },
        {
          service: "triple_sg",
          chartType: STREAMGRAPH_MODE,
          query: { text: "some query" },
        }
      );
      const store = mockStore(storeObject);

      const promise = Promise.resolve();
      Object.assign(navigator, {
        clipboard: {
          writeText: () => promise,
        },
      });

      jest.spyOn(navigator.clipboard, "writeText");

      act(() => {
        render(
          <Provider store={store}>
            <LocalizationProvider localization={storeObject.localization}>
              <Modals />
            </LocalizationProvider>
          </Provider>,
          container
        );

        const select = document.querySelector(".indented-modal-btn");
        const event = new Event("click", { bubbles: true });
        select.dispatchEvent(event);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "Open Knowledge Maps (2021). Overview of research on some query. Retrieved from http://localhost/ [9 Jul 2020]."
      );

      await act(() => promise);
      const buttonLabel = document
        .querySelector(".indented-modal-btn")
        .textContent.trim();
      expect(buttonLabel).toEqual(storeObject.localization.copied_button_text);
    });

    it("triggers a correct redux action when citation modal is closed", () => {
      const storeObject = setup(
        { openCitationModal: true },
        { service: "triple_sg", chartType: STREAMGRAPH_MODE }
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
      const expectedPayload = closeCitationModal();

      expect(actions).toEqual([expectedPayload]);
    });
  });

  describe("paper citation modal", () => {
    const EXAMPLE_PAPER = {
      title: "Test paper",
      year: "2021",
      authors_objects: [{ firstName: "John", lastName: "Doe" }],
      list_link: { isDoi: false, address: "https://example.com" },
    };

    it("renders citation modal", () => {
      const storeObject = setup(
        { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
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

      expect(document.querySelector("#cite-paper-title").textContent).toEqual(
        storeObject.localization.cite_paper
      );

      expect(
        document.querySelector("#copy-paper-citation").textContent.trim()
      ).toEqual("Doe, J. (2021). Test paper. https://example.com");
    });

    it("triggers a correct redux action when citation modal is closed", () => {
      const storeObject = setup(
        { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
        { service: "pubmed" }
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
      const expectedPayload = hideCitePaper();

      expect(actions).toEqual([expectedPayload]);
    });

    it("changes the citation style", () => {
      const storeObject = setup(
        { citedPaper: Object.assign({}, EXAMPLE_PAPER) },
        {
          service: "base",
          query: { text: "some query" },
        }
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

      const buttons = document.querySelectorAll(".cit-style-label");

      act(() => {
        const event = new MouseEvent("click", { bubbles: true });
        buttons[3].dispatchEvent(event);
      });

      // tbh I don't get it why the output is this and not ACM
      expect(
        document.querySelector("#copy-paper-citation").textContent.trim()
      ).toBe("Doe, J. (2021). Test paper. https://example.com\n https://example.com");
    });
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

    it("covis knowledge map info modal renders", () => {
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
        "KNOWLEDGE MAP OF COVID-19 RESEARCH CURATED BY EXPERTS"
      );
    });

    it("default knowledge map info modal renders", () => {
      const storeObject = setup(
        { openInfoModal: true },
        { service: "triple_km", chartType: KNOWLEDGEMAP_MODE }
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
        { service: "triple_sg", chartType: STREAMGRAPH_MODE }
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
        { service: "triple_sg", chartType: STREAMGRAPH_MODE }
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
