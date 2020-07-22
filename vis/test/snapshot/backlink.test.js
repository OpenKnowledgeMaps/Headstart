import React from "react";
import { Provider } from 'react-redux';
import renderer from "react-test-renderer";
import configureStore from 'redux-mock-store';

import { Backlink } from "../../js/components/Backlink";

const mockStore = configureStore([]);

describe( 'Backlink component snapshot', () => {
    it("matches as snapshot", () => {
        const store = mockStore({
            zoom: true,
          })
        const tree = renderer.create(
          <Provider store={store}>
            <Backlink />
          </Provider>
        ).toJSON();
        expect(tree).toMatchSnapshot();
      });
} )