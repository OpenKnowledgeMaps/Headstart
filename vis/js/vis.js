import { HeadstartFSM } from "./headstart";

const headstartTemplate = require("templates/headstart.handlebars");
const InfoTemplate = require("templates/misc/info_modal.handlebars");
const IFrameTemplate = require("templates/misc/iframe_modal.handlebars");
const ImagesTemplate = require("templates/misc/images_modal.handlebars");

// make namespace global - should be moved to CONSTANTS file
window.namespace = "headstart";

export var Headstart = function(host, path, tag, files, options) {
  const viz = $("#"+tag);

  viz.append(headstartTemplate());
  viz.append(InfoTemplate());
  viz.append(IFrameTemplate());;
  viz.append(ImagesTemplate());

  document.getElementById(tag).className = namespace;

  const headstart = new HeadstartFSM(host, path, tag, files, options);
  // make headstart global
  window.headstart = headstart;

  headstart.start();

}