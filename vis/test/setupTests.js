// tests setup file
import 'regenerator-runtime/runtime';
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import Hypher from "hypher";
window["Hypher"] = Hypher;
window["Hypher"]["languages"] = {};

window.headstartInstance = {};

// replaceAll on node
// https://stackoverflow.com/questions/9641481/how-to-create-a-string-replace-all-function/9641786
RegExp.escape = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

String.prototype.replaceAll = function(search, replace) {
  return this.replace(new RegExp(RegExp.escape(search), "g"), replace);
};

configure({ adapter: new Adapter() });
