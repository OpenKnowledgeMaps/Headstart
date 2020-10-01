import React from "react";

const DocumentTypes = (props) => {
  return (
    // html template starts here
    <span className="context_moreinfo" {...props}>
      {props.label}
    </span>
    // html template ends here
  );
};

export default DocumentTypes;
