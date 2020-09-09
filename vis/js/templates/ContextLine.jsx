import React from "react";

// inside the 'children' variable are various React components
// from directory ./contextfeatures
const ContextLine = ({ children }) => {
  return (
    // html template starts here
    // TODO <p id="context"> will move to here after the whole MVP is finished
    <>{children}</>
    // html template ends here
  );
};

export default ContextLine;
