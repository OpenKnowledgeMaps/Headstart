import Handlebars from 'handlebars';

import { HeadstartFSM } from "./headstart";

const headstartTemplate = require("templates/headstart.handlebars");
const InfoTemplate = require("templates/misc/info_modal.handlebars");
const IFrameTemplate = require("templates/misc/iframe_modal.handlebars");

// make namespace global - should be moved to CONSTANTS file
window.namespace = "headstart";

export var Headstart = function(host, path, tag, files, options) {

  const vis_directory = "vis/";
  const lib_directory = "lib/";
  const templ_path = host + path + vis_directory + "templates/";

  const viz = $("#"+tag);

  let elem = headstartTemplate();
  viz.append(elem);

  elem = InfoTemplate();
  viz.append(elem);

  elem = IFrameTemplate();
  viz.append(elem);

  document.getElementById(tag).className = namespace;

  const headstart = new HeadstartFSM(host, path, tag, files, options);
  // make headstart global
  window.headstart = headstart;

  headstart.start();

}