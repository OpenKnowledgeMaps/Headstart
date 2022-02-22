import "styles/main.scss";

import config from "config";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// needed for draggable modals (it can be refactored with react-bootstrap though)
import "./lib/jquery-ui.min.js";

import HeadstartRunner from "./js/HeadstartRunner";

const start = (additional_config) => {
  if (data_config) {
    Object.assign(config, data_config);
  }
  if (additional_config) {
    Object.assign(config, additional_config);
  }

  const headstartRunner = new HeadstartRunner(config);
  headstartRunner.run();
};

export { start };
