import React from "react";

import Highlight from "../../components/Highlight";

const AccessIcons = ({ isOpenAccess, isFreeAccess, isDataset }) => {
  return (
    // html template starts here
    <div id="oa">
      {!!isOpenAccess && (
        <span id="open-access-logo_list">
          <Highlight>open access </Highlight>
          <span className="outlink_symbol">&#61596;</span>
        </span>
      )}
      {!!isFreeAccess && (
        <span id="free-access-logo_list" className="free-access-logo">
          <Highlight>free access </Highlight>
          <span className="outlink_symbol">&#61596;</span>
        </span>
      )}
      {!!isDataset && (
        <span id="dataset-icon_list" className="dataset-tag">
          <Highlight>dataset </Highlight>
          <span className="fa fa-database"></span>
        </span>
      )}
    </div>
    // html template ends here
  );
};

export default AccessIcons;
