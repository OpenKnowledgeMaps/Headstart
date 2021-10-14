 /* Load stylesheets and bootstrap */
import 'styles/main.scss';

/* Import headstart module to initiliase HeadstartFSM */
/* Notice 'import * as hs' -> hs.headstart is not read-only */
import config from 'config';
import * as hs from 'headstart';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

var start = function(json_data) {
    if(data_config) Object.assign(config, data_config);
    window.namespace = "headstart";
    window.headstartInstance = new hs.HeadstartFSM(json_data);
    window.headstartInstance.start();
}

export {start};
