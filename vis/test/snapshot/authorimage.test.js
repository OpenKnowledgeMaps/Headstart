import React from "react";
import renderer from "react-test-renderer";

import AuthorImage from "../../js/templates/AuthorImage";

describe("Author image component snapshot", () => {
  it("matches as author image snapshot", () => {
    const tree = renderer
      .create(<AuthorImage url="https://example.com/12345" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
