import { render } from "@testing-library/react";
import Citations from "../../../../js/templates/listentry/Citations";
import React from "react";

describe("Citations in the ListEntry component", () => {
  const setup = (numberOfCitation: number, labelOfCitations: string) => {
    const { container } = render(
      <Citations number={numberOfCitation} label={labelOfCitations} />,
    );

    return container;
  };

  it("Shows citations in the correct order (numberOfCitation and labelOfCitations)", () => {
    const NUMBER_OF_CITATIONS = 15;
    const LABEL_OF_CITATIONS = "citations";

    const container = setup(NUMBER_OF_CITATIONS, LABEL_OF_CITATIONS);

    const citationsContainer = container.querySelector(".list_readers");
    expect(citationsContainer).toBeInTheDocument();

    const spanWithLabelOfCitations = citationsContainer?.querySelector(
      ".list_readers_entity",
    );
    expect(spanWithLabelOfCitations).toBeInTheDocument();

    expect(citationsContainer).toHaveTextContent(
      `${NUMBER_OF_CITATIONS} ${LABEL_OF_CITATIONS}`,
    );
  });
});
