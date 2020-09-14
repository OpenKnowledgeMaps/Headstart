import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import configureStore from "redux-mock-store";

import AuthorImage from "../../js/components/AuthorImage";
import defaultImage from "../../images/author_default.png";

const mockStore = configureStore([]);
const setup = (overrideStore = {}, returnStore = true) => {
  const storeObject = Object.assign(
    {
      contextLine: {
        showAuthor: true,
        author: {
          imageLink: "http://pictures.org/link-to-author",
        },
      },
    },
    overrideStore
  );

  let store = null;
  if (returnStore) {
    store = mockStore(storeObject);
  }

  return { store, storeObject };
};

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
    const { store } = setup();
    act(() => {
      render(<AuthorImage store={store} />, container);
    });

    expect(container.childNodes.length).toBe(1);
  });

  it("doesn't render", () => {
    const { storeObject } = setup({}, false);
    storeObject.contextLine.showAuthor = false;

    const store = mockStore(storeObject);

    act(() => {
      render(<AuthorImage store={store} />, container);
    });

    expect(container.childNodes.length).toBe(0);
  });

  it("renders with correct link", () => {
    const LINK = "https://custom-link.com/12345";
    const { storeObject } = setup({}, false);
    storeObject.contextLine.author.imageLink = LINK;

    const store = mockStore(storeObject);

    act(() => {
      render(<AuthorImage store={store} />, container);
    });

    expect(
      container.querySelector("#author_image_link").getAttribute("href")
    ).toEqual(LINK);
  });

  it("renders with correct image", () => {
    const LINK = "https://custom-link.com/12345";
    const { storeObject } = setup({}, false);
    storeObject.contextLine.author.imageLink = LINK;

    const store = mockStore(storeObject);

    act(() => {
      render(<AuthorImage store={store} />, container);
    });

    expect(
      container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${LINK})`);
  });

  it("renders with correct default image", () => {
    const LINK = undefined;
    const EXPECTED_LINK = defaultImage;
    const { storeObject } = setup({}, false);
    storeObject.contextLine.author.imageLink = LINK;

    const store = mockStore(storeObject);

    act(() => {
      render(<AuthorImage store={store} />, container);
    });

    expect(
      container.querySelector("#author_image").getAttribute("style")
    ).toContain(`background-image: url(${EXPECTED_LINK})`);
  });
});
