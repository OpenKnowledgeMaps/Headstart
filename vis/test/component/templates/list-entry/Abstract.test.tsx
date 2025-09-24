import { render } from "@testing-library/react";
import { Localization } from "../../../../js/i18n/localization";
import LocalizationProvider from "../../../../js/components/LocalizationProvider";
import Abstract from "../../../../js/templates/listentry/Abstract";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

describe("Abstract in the ListEntry component", () => {
  const setup = (isSelectedPaper: boolean, abstractText?: string) => {
    const LOCALIZATION_OBJECT_MOCK: Pick<Localization, "default_abstract"> = {
      default_abstract: "No abstract available",
    };

    const STORE_DATA_MOCK = {
      selectedPaper: isSelectedPaper,
      list: { searchValue: "" },
      query: { parsedTerms: "" },
    };

    const STORE_MOCK = mockStore(STORE_DATA_MOCK);

    const { container } = render(
      <LocalizationProvider
        localization={LOCALIZATION_OBJECT_MOCK as Localization}
      >
        <Provider store={STORE_MOCK}>
          <Abstract text={abstractText as string} />
        </Provider>
      </LocalizationProvider>,
    );

    return container;
  };

  it("Shows abstract text if it is presented", () => {
    const container = setup(true, "Some cool abstract text.");

    const paragraphWithAbstract = container.querySelector("#list_abstract");
    expect(paragraphWithAbstract).toBeInTheDocument();
    expect(paragraphWithAbstract).toHaveTextContent("Some cool abstract text.");
  });

  it("Shows abstract text with additional styling if it is presented and document is not selected", () => {
    const container = setup(false, "Some cool abstract text.");

    const paragraphWithAbstract = container.querySelector("#list_abstract");
    expect(paragraphWithAbstract).toBeInTheDocument();
    expect(paragraphWithAbstract).toHaveClass("short");
    expect(paragraphWithAbstract).toHaveTextContent("Some cool abstract text.");
  });

  it("Shows template text from localization if abstract is not presented", () => {
    const container = setup(false, undefined);

    const paragraphWithAbstract = container.querySelector("#list_abstract");
    expect(paragraphWithAbstract).toBeInTheDocument();
    expect(paragraphWithAbstract).toHaveTextContent("No abstract available");
  });
});
