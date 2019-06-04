 /* Load stylesheets and bootstrap */
require('styles/main.scss');
require('bootstrap-loader');
require('font-awesome/scss/font-awesome.scss');

/* Import headstart module to initiliase HeadstartFSM */
/* Notice 'import * as hs' -> hs.headstart is not read-only */
import config from 'config';
import * as hs from 'headstart';

var start = function(json_data) {
    if(data_config) Object.assign(config, data_config);
    window.namespace = "headstart";
    var headstart = new hs.HeadstartFSM(json_data);
    headstart.start();
}

export {start};
