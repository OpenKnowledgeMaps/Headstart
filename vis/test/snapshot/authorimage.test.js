import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";

import AuthorImage from "../../js/components/AuthorImage";

const mockStore = configureStore([]);

describe("Author image component snapshot", () => {
  it("matches as author image snapshot", () => {
    const store = mockStore({
      contextLine: {
        showAuthor: true,
        author: {
          imageLink: "https://example.com/12345"
        }
      }
    });
    const tree = renderer
      .create(
        <Provider store={store}>
          <AuthorImage />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
