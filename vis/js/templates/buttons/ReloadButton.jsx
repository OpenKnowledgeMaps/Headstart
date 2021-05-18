import React, { useState } from "react";
import useGsheetsUpdate from "../../utils/useGsheetsUpdate";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const ReloadButton = ({
  lastUpdate,
  apiProperties: { headstartPath, sheetID, persistenceBackend },
}) => {
  const localization = useLocalizationContext();

  const showButton = useGsheetsUpdate(
    lastUpdate,
    headstartPath,
    sheetID,
    persistenceBackend
  );
  const [showDescription, setShowDescription] = useState(true);

  const handleReload = () => location.reload();
  const handleHide = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDescription(false);
  };

  if (!showButton) {
    return null;
  }

  return (
    // html template starts here
    <div
      id="reload"
      className={
        "reload-button show-reload-button" +
        (showDescription ? "" : " small-reload")
      }
      onClick={handleReload}
    >
      <i className="fas fa-redo"></i>
      <span
        id="reload-text"
        className={showDescription ? "" : "hide-reload-text"}
      >
        {" "}
        {localization.update_available} <br />
        <a id="reload" className="dismiss-reload">
          {localization.reload_now}
        </a>{" "}
        {localization.reload_or}{" "}
        <a id="dismiss-reload" className="dismiss-reload" onClick={handleHide}>
          {localization.do_it_later}
        </a>
      </span>
    </div>
    // html template ends here
  );
};

export default ReloadButton;
