import React from "react";

import Highlight from "../../components/Highlight";

const AccessIcons = ({ isOpenAccess, isFreeAccess, isDataset, tags }) => {
  return (
    // html template starts here
    <div id="oa">
      {!!isOpenAccess && (
        <span id="open-access-logo_list">
            <span className="access_icon outlink_symbol">&#61596;</span>
            <Highlight>open access</Highlight>
        </span>
      )}
      {!!isFreeAccess && (
        <span id="free-access-logo_list" className="access_icon free-access-logo">
            <span className="outlink_symbol">&#61596;</span>
            <Highlight>free access </Highlight>
        </span>
      )}
      {!!isDataset && (
        <span id="dataset-icon_list" className="access_icon dataset-tag">
            <span className="fa fa-database"></span>
            <Highlight>dataset </Highlight>
        </span>
      )}
      {tags}
    </div>
    // html template ends here
  );
};

export default AccessIcons;
