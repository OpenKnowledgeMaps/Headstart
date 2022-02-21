import "styles/main.scss";

import config from "config";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// needed for draggable modals (it can be refactored with react-bootstrap though)
import "./lib/jquery-ui.min.js";

import Intermediate from "./js/intermediate";

const start = (additional_config) => {
  if (data_config) {
    Object.assign(config, data_config);
  }
  if (additional_config) {
    Object.assign(config, additional_config);
  }

  const headstartRunner = new Intermediate(config);
  headstartRunner.render();
};

export { start };
