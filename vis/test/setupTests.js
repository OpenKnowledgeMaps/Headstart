// tests setup file
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import Hypher from "hypher";
window["Hypher"] = Hypher;
window["Hypher"]["languages"] = {};

window.headstartInstance = {};

configure({ adapter: new Adapter() });
