import { expect, describe, it, vitest } from "vitest";

import React from "react";
import { render } from "@testing-library/react";

import AuthorImage from "../../js/templates/AuthorImage";
import defaultImage from "../../images/author_default.png";

describe("Author image component", () => {
  it("renders", () => {
    const result = render(
      <AuthorImage url="http://pictures.org/link-to-author" />
    );

    expect(result.container.childNodes.length).toBe(1);
  });

  it("renders with correct link", () => {
    const LINK = "https://custom-link.com/12345";

    const result = render(<AuthorImage url={LINK} />);

    expect(
      result.container.querySelector("#author_image_link").getAttribute("href")
    ).toEqual(LINK);
  });

  it("renders with correct image", () => {
    const LINK = "https://custom-link.com/12345";

    const result = render(<AuthorImage url={LINK} />);

    expect(
      result.container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${LINK})`);
  });

  it("renders with correct default image", () => {
    const LINK = undefined;
    const EXPECTED_LINK = defaultImage;

    const result = render(<AuthorImage url={LINK} />);

    expect(
      result.container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${EXPECTED_LINK})`);
  });
});
