import React from "react";
import { shallow } from "enzyme";

import { Backlink } from "../js/components/Backlink";


/**
 * Redux state tests are missing.
 * They probably belong in a separate file...
 */

/**
 * All the tests for the Backlink component, including its template, can be found here.
 */
describe("Backlink component", () => {
  describe("visibility", () => {
    it("renders shown", () => {
      const wrapper = shallow(<Backlink hidden={false}/>);
      expect(wrapper.exists()).toBe(true);
    });

    it("renders hidden", () => {
      const wrapper = shallow(<Backlink hidden={true}/>);
      expect(wrapper.type()).toEqual(null);
    });
  });

});
