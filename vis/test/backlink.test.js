import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { configure, shallow } from "enzyme";
import { Backlink } from "../js/components/Backlink";

configure({ adapter: new Adapter() });
it("renders without crashing", () => {
  shallow(<Backlink onClick={() => alert("...going back!")} />);
});
