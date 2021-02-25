import React, { useState } from "react";
import useGsheetsUpdate from "../../utils/useGsheetsUpdate";

const ReloadButton = ({
  lastUpdate,
  apiProperties: { headstartPath, sheetID, persistenceBackend },
}) => {
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
        An update is available <br />
        <a id="reload" className="dismiss-reload">
          reload now
        </a>{" "}
        or{" "}
        <a id="dismiss-reload" className="dismiss-reload" onClick={handleHide}>
          do it later
        </a>
      </span>
    </div>
    // html template ends here
  );
};

export default ReloadButton;
