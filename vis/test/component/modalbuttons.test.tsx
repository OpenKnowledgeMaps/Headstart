import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render } from "@testing-library/react";
import ModalButtons from "../../js/components/ModalButtons";

// Configuring the mock Redux store
const mockStore = configureStore([]);

// Preparing mocked Redux store data
const getMockStoreData = (
  isWithShareButton: boolean,
  isWithShareViaEmail: boolean,
  isWithShareViaTwitter: boolean,
  isWithEmbedButton: boolean,
  isWithFAQButton: boolean,
  isWithCitationButton: boolean,
  isWithReloadButton: boolean
) => {
  return {
    modals: {
      showShareButton: isWithShareButton,
      showEmailButton: isWithShareViaEmail,
      showTwitterButton: isWithShareViaTwitter,
      showEmbedButton: isWithEmbedButton,
      showFAQsButton: isWithFAQButton,
      showCitationButton: isWithCitationButton,
      showReloadButton: isWithReloadButton,
      apiProperties: {
        lastUpdate: "",
        headstartPath: "//localhost:8085/headstart/server/",
        sheetID: null,
        persistenceBackend: "",
      },
    },
    misc: {
      isEmbedded: false,
    },
  };
};

// Setup function for the ModalButtons component tests
const setup = (
  isWithShareButton: boolean,
  isWithShareViaEmail: boolean,
  isWithShareViaTwitter: boolean,
  isWithEmbedButton: boolean,
  isWithFAQButton: boolean,
  isWithCitationButton: boolean,
  isWithReloadButton: boolean
) => {
  const mockStoreData = getMockStoreData(
    isWithShareButton,
    isWithShareViaEmail,
    isWithShareViaTwitter,
    isWithEmbedButton,
    isWithFAQButton,
    isWithCitationButton,
    isWithReloadButton
  );
  const store = mockStore(mockStoreData);

  const { container } = render(
    <Provider store={store}>
      <ModalButtons />
    </Provider>
  );

  return container;
};

// Test cases
describe("ModalButtons component", () => {
  describe("Renders with correct button", () => {
    it("Renders with the share button", () => {
      const container = setup(true, false, false, false, false, false, false);

      const shareButton = container.querySelector("#sharebutton");
      expect(shareButton).toBeInTheDocument();
    });

    it("Renders with the share via email button", () => {
      const container = setup(false, true, false, false, false, false, false);

      const shareWithEmailButton = container.querySelector(".sharebutton_mail");
      expect(shareWithEmailButton).toBeInTheDocument();
    });

    it("Renders with the share via email button", () => {
      const container = setup(true, true, false, false, false, false, false);

      const shareWithEmailButton = container.querySelector(".sharebutton_mail");
      expect(shareWithEmailButton).toBeInTheDocument();
    });

    it("Renders with the share via twitter button", () => {
      const container = setup(false, false, true, false, false, false, false);

      const shareViaTwitterButton = container.querySelector(
        ".sharebutton_twitter"
      );
      expect(shareViaTwitterButton).toBeInTheDocument();
    });

    it("Renders with the embed button", () => {
      const container = setup(false, false, false, true, false, false, false);

      const embedButton = container.querySelector("#embedlink");
      expect(embedButton).toBeInTheDocument();
    });

    it("Renders with the embed button", () => {
      const container = setup(false, false, false, true, false, false, false);

      const embedButton = container.querySelector("#embedlink");
      expect(embedButton).toBeInTheDocument();
    });

    it("Renders with the FAQ button", () => {
      const container = setup(false, false, false, false, true, false, false);

      const faqButton = container.querySelector("#faqs_button");
      expect(faqButton).toBeInTheDocument();
    });

    it("Renders with the citation button", () => {
      const container = setup(false, false, false, false, false, true, false);

      const citationButton = container.querySelector("#citationlink");
      expect(citationButton).toBeInTheDocument();
    });

    it("Renders without the reload button if data for it was not provided", () => {
      const container = setup(false, false, false, false, false, false, true);

      const reloadButton = container.querySelector("#reload");
      expect(reloadButton).not.toBeInTheDocument();
    });
  });

  describe("Renders with correct buttons combinations", () => {
    it("Renders with citation and email buttons", () => {
      const container = setup(false, true, false, false, false, true, false);

      const shareWithEmailButton = container.querySelector(".sharebutton_mail");
      expect(shareWithEmailButton).toBeInTheDocument();

      const citationButton = container.querySelector("#citationlink");
      expect(citationButton).toBeInTheDocument();
    });

    it("Renders with citation and share buttons", () => {
      const container = setup(true, false, false, false, false, true, false);

      const shareButton = container.querySelector("#sharebutton");
      expect(shareButton).toBeInTheDocument();

      const citationButton = container.querySelector("#citationlink");
      expect(citationButton).toBeInTheDocument();
    });

    it("Renders with citation, faq and embed buttons", () => {
      const container = setup(false, false, false, true, true, true, false);

      const citationButton = container.querySelector("#citationlink");
      expect(citationButton).toBeInTheDocument();

      const faqButton = container.querySelector("#faqs_button");
      expect(faqButton).toBeInTheDocument();

      const embedButton = container.querySelector("#embedlink");
      expect(embedButton).toBeInTheDocument();
    });
  });
});
