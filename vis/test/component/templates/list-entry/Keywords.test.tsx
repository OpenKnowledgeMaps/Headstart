import { render } from "@testing-library/react";
import Keywords from "../../../../js/templates/listentry/Keywords";
import React from "react";
import LocalizationProvider from "../../../../js/components/LocalizationProvider";
import { Localization } from "../../../../js/i18n/localization";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

describe("Keywords in the ListEntry component", () => {
  const setup = (keywords: string, query: string) => {
    const LOCALIZATION_OBJECT_MOCK = {
      keywords: "Keywords",
    } as Localization;

    const STORE_DATA_MOCK = {
      list: { searchValue: "" },
      query: {
        parsedTerms: [query],
        highlightTerms: true,
        useLookBehind: true,
      },
    };

    const STORE_MOCK = mockStore(STORE_DATA_MOCK);

    const { container } = render(
      <LocalizationProvider localization={LOCALIZATION_OBJECT_MOCK}>
        <Provider store={STORE_MOCK}>
          <Keywords>{keywords}</Keywords>
        </Provider>
      </LocalizationProvider>,
    );

    return container;
  };

  it("Shows keywords", () => {
    const KEYWORDS_TEXT = "Higher education is a distinct context...";
    const HIGHLIGHTED_WORD = "";

    const container = setup(KEYWORDS_TEXT, HIGHLIGHTED_WORD);

    const keywordsContainer = container.querySelector(".list_row");
    expect(keywordsContainer).toBeInTheDocument();

    const keywordsLabel = keywordsContainer?.firstChild;
    expect(keywordsLabel).toHaveTextContent("Keywords:");

    const keywordsContent = keywordsContainer?.lastChild;
    expect(keywordsContent).toHaveTextContent(KEYWORDS_TEXT);
  });

  it("Shows keywords and highlight query words in them", () => {
    const KEYWORDS_TEXT = "Higher education is a distinct context...";
    const HIGHLIGHTED_WORD = "education";

    const container = setup(KEYWORDS_TEXT, HIGHLIGHTED_WORD);

    const keywordsContainer = container.querySelector(".list_row");
    expect(keywordsContainer).toBeInTheDocument();

    const highlightedWord = keywordsContainer?.querySelector(
      ".query_term_highlight ",
    );
    expect(highlightedWord).toBeInTheDocument();
  });
});
