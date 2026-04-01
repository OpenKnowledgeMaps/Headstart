import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import CitationModal from "../../js/templates/modals/CitationModal";
import React from "react";
import { Provider } from "react-redux";
import LocalizationProvider from "../../js/components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../js/reducers/chartType";
import { formatString } from "../../js/utils/string";
import { Localization } from "../../js/i18n/localization";

// Configuring the mock Redux store
const mockStore = configureStore([]);

// Preparing mocked Redux store data
const getMockStoreData = (isStreamgraph: boolean) => {
  return {
    chartType: isStreamgraph ? STREAMGRAPH_MODE : null,
    modals: {
      openCitationModal: true,
    },
    query: {
      text: "climate change and impact",
    },
    heading: {
      titleStyle: null,
    },
    misc: {
      timestamp: null,
    },
    q_advanced: {
      text: null,
    },
    localization: {
      cite_title_km: "Cite this knowledge map",
      cite_title_sg: "Cite this streamgraph",
      citation_template:
        "Open Knowledge Maps (${year}). ${type} for research on ${query}. Retrieved from ${source} [${date}].",
    },
  };
};

// Creating formatted citation text that will be also displayed in the component
const getCitationText = (isStreamgraph: boolean) => {
  const mockStoreData = getMockStoreData(isStreamgraph);
  const citationTemplate = mockStoreData.localization.citation_template;
  const currentYear = new Date().getFullYear();
  const mockCitationStringData = {
    year: String(currentYear),
    type: isStreamgraph ? "Streamgraph" : "Knowledge Map",
    query: "climate change and impact",
    source: "http://localhost:3000/",
    date: "",
  };

  return formatString(citationTemplate, mockCitationStringData).replace(
    " [].",
    ".",
  );
};

// Setup function for the CitationModal component tests
const setup = (isStreamgraph: boolean) => {
  const mockStoreData = getMockStoreData(isStreamgraph);
  const store = mockStore(mockStoreData);
  const localization = mockStoreData.localization as Localization;

  render(
    <Provider store={store}>
      <LocalizationProvider localization={localization}>
        <CitationModal />
      </LocalizationProvider>
    </Provider>,
  );
};

// Test cases
describe("CitationModal component", () => {
  it("Renders with correct title for a knowledge map", () => {
    setup(false);
    expect(screen.getByText("Cite this knowledge map")).toBeInTheDocument();
  });

  it("Renders with correct title for a streamgraph", () => {
    setup(true);
    expect(screen.getByText("Cite this streamgraph")).toBeInTheDocument();
  });

  it("Renders with a correct citation text for a knowledge map", () => {
    setup(false);
    const citationText = getCitationText(false);
    expect(screen.getByText(citationText)).toBeInTheDocument();
  });

  it("Renders with a correct citation text for a streamgraph", () => {
    setup(true);
    const citationText = getCitationText(true);
    expect(screen.getByText(citationText)).toBeInTheDocument();
  });
});
