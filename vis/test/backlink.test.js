import React from "react";
import { shallow } from "enzyme";
import { Backlink } from "../js/components/Backlink";

it("renders without crashing", () => {
  shallow(<Backlink onClick={() => alert("...going back!")} />);
});
