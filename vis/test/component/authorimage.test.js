import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import AuthorImage from "../../js/templates/AuthorImage";
import defaultImage from "../../images/author_default.png";

describe("Author image component", () => {
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

  it("renders", () => {
    act(() => {
      render(
        <AuthorImage url="http://pictures.org/link-to-author" />,
        container
      );
    });

    expect(container.childNodes.length).toBe(1);
  });

  it("renders with correct link", () => {
    const LINK = "https://custom-link.com/12345";

    act(() => {
      render(<AuthorImage url={LINK} />, container);
    });

    expect(
      container.querySelector("#author_image_link").getAttribute("href")
    ).toEqual(LINK);
  });

  it("renders with correct image", () => {
    const LINK = "https://custom-link.com/12345";

    act(() => {
      render(<AuthorImage url={LINK} />, container);
    });

    expect(
      container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${LINK})`);
  });

  it("renders with correct default image", () => {
    const LINK = undefined;
    const EXPECTED_LINK = defaultImage;

    act(() => {
      render(<AuthorImage url={LINK} />, container);
    });

    expect(
      container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${EXPECTED_LINK})`);
  });
});
