// tests setup file
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import $ from "jquery";
global.$ = global.jQuery = $;

import d3 from "d3";
global.d3 = d3;

import Hypher from "hypher";
window["Hypher"] = Hypher;
window["Hypher"]["languages"] = {};

window.headstartInstance = {};

configure({ adapter: new Adapter() });
