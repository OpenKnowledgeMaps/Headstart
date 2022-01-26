import React from "react";

import Highlight from "../../components/Highlight";

const AccessIcons = ({ isOpenAccess, isFreeAccess, isDataset, tags }) => {
  return (
    // html template starts here
    <div id="oa">
      {!!isOpenAccess && (
        <span className="paper-tag open-access-tag">
          <span className="access_icon outlink_symbol">
            <i className="fas fa-lock-open"></i>
          </span>
          <Highlight>open access</Highlight>
        </span>
      )}
      {!!isFreeAccess && (
        <span className="paper-tag free-access-tag">
          <span className="access_icon outlink_symbol">
            <i className="fas fa-lock-open"></i>
          </span>
          <Highlight>free access</Highlight>
        </span>
      )}
      {!!isDataset && (
        <span className="paper-tag dataset-tag">
          <span className="fa fa-database access_icon"></span>
          <Highlight>dataset</Highlight>
        </span>
      )}
      {tags}
    </div>
    // html template ends here
  );
};

export default AccessIcons;
