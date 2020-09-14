import React from "react";

const DocumentTypesPopover = (props) => {
  return (
    // html template starts here
    <span className="context_moreinfo" {...props}>
      {props.label}
    </span>
    // html template ends here
  );
};

export default DocumentTypesPopover;
