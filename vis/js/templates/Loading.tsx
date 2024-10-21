// @ts-nocheck
import React from "react";

import { useLocalizationContext } from "../components/LocalizationProvider";

const Loading = () => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="map-loading-screen" className="loading-screen">
      <div id="loading-text" className="loading-text">
        {localization.loading}
      </div>
      <div id="loading-spinner" className="loading-spinner">
        <span
          id="spinner-map-icon"
          className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
        ></span>
      </div>
    </div>
    // html template ends here
  );
};

export default Loading;
