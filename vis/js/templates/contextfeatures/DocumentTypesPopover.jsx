import React from "react";

const DocumentTypesPopover = (props) => {
  return (
    // html template starts here
    <span
      id="document_types"
      className="context_moreinfo context_item"
      {...props}
    >
      {props.label}
    </span>
    // html template ends here
  );
};

export default DocumentTypesPopover;
