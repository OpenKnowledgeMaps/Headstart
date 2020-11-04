import React from "react";

const AccessIcons = ({ isOpenAccess, isFreeAccess, isDataset }) => {
  return (
    // html template starts here
    <div id="oa" className="highlightable">
      {!!isOpenAccess && (
        <span id="open-access-logo_list" className="highlightable">
          open access <span className="outlink_symbol">&#61596;</span>
        </span>
      )}
      {!!isFreeAccess && (
        <span id="free-access-logo_list" className="free-access-logo">
          free access <span className="outlink_symbol">&#61596;</span>
        </span>
      )}
      {!!isDataset && (
        <span id="dataset-icon_list" className="dataset-tag highlightable">
          dataset <span className="fa fa-database"></span>
        </span>
      )}
    </div>
    // html template ends here
  );
};

export default AccessIcons;
