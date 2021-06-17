import { useState, useEffect } from "react";
import $ from "jquery";

const CHECK_INTERVAL = 6000;

/**
 * Performs a check periodically if the gsheet specified by the 'sheetID' param
 * can be updated.
 *
 * Returns true if yes and stops checking.
 *
 * @param {String} lastUpdate timestamp of the last update
 * @param {String} headstartPath path to the headstart server
 * @param {String} sheetID gsheet id
 * @param {String} persistenceBackend backend type ('api'|???)
 *
 * @returns true if the gsheet can be updated
 */
const useGsheetsUpdate = (
  lastUpdate,
  headstartPath,
  sheetID,
  persistenceBackend
) => {
  const [updatable, setUpdatable] = useState(false);

  useEffect(() => {
    const state = {};

    const checkForUpdates = () => {
      const lastUpdateEncoded = encodeURIComponent(lastUpdate);

      const address = `${headstartPath}services/GSheetUpdateAvailable.php\
?vis_id=${sheetID}&persistence_backend=${persistenceBackend}\
&gsheet_last_updated=${lastUpdateEncoded}`;

      $.getJSON(address, (output) => {
        if (output.update_available) {
          setUpdatable(true);
          window.clearInterval(state.updateInterval);
        }
      });
    };

    state.updateInterval = window.setInterval(checkForUpdates, CHECK_INTERVAL);

    return () => {
      window.clearInterval(state.updateInterval);
    };
  }, [lastUpdate, headstartPath, sheetID, persistenceBackend, setUpdatable]);

  return updatable;
};

export default useGsheetsUpdate;
