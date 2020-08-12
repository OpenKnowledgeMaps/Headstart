import React from "react";

const DocumentTypesPopover = ({ label, popoverLabel, text }) => {
  return (
    // html template starts here
    <span
      id="document_types"
      data-content={`${popoverLabel}<br /><br /> ${text}`}
      data-toggle="popover"
      data-trigger="hover"
      data-html="true"
      className="context_moreinfo"
      data-original-title=""
      title=""
    >
      {label}
    </span>
    // html template ends here
  );
};

export default DocumentTypesPopover;
