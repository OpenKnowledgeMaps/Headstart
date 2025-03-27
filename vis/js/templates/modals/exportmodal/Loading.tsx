// @ts-nocheck

import React from "react";

import { useLocalizationContext } from "../../../components/LocalizationProvider";

const Loading = () => {
  const loc = useLocalizationContext();

  return (
    <div id="spinner-iframe">
      <p className="wait-message">{loc.pdf_load_text}</p>
      <p className="wait-spinner">
        <span
          id="spinner-iframe-icon"
          className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
        ></span>{" "}
      </p>
    </div>
  );
};

export default Loading;
