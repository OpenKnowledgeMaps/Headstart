import React from "react";

// inside the 'children' variable are various React components
// from directory ./contextfeatures
const ContextLine = ({ children }) => {
  return (
    // html template starts here
    <p id="context">{children}</p>
    // html template ends here
  );
};

export default ContextLine;
