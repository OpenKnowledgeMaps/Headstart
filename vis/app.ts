import "styles/main.scss";

import config from "./js/default-config";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// needed for draggable modals (it can be refactored with react-bootstrap though)
import "./lib/jquery-ui.min.js";

import HeadstartRunner from "./js/HeadstartRunner";

export const start = (additionalConfig: any) => {
  if (data_config) {
    Object.assign(config, data_config);
  }
  if (additionalConfig) {
    Object.assign(config, additionalConfig);
  }

  const headstartRunner = new HeadstartRunner(config);
  headstartRunner.run();
};
