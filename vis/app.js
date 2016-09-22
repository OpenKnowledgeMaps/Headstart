/* Load stylesheets and bootstrap */
require('styles/main.scss');
require('bootstrap-loader');

/* Global jQuery and jquery-plugins */
import $ from 'jquery';
import 'lib/highlightRegex.min.js';
import 'jquery-dotdotdot/src/jquery.dotdotdot.min.js';
import 'hypher/dist/jquery.hypher.js';

/* Import headstart module to initiliase HeadstartFSM */
/* Notice 'import * as hs' -> hs.headstart is not read-only */
import * as hs from 'headstart';

/* app configs from the example applications */
// import { app_config } from 'examples/local_files/app-config.js'
import { app_config } from 'examples/repos/headstart/app-config.js'


/* Initiliase HeadstartFSM */

// make namespace global - should be moved to CONSTANTS file
window.namespace = "headstart";

hs.headstart = new hs.HeadstartFSM(
    "visualization",
    app_config.data,
    app_config.options
);
hs.headstart.start();
