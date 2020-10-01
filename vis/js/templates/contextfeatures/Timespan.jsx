import React from "react";

const Timespan = ({ children }) => {
  return (
    // html template starts here
    <span id="timespan" className="context_item">
      {children}
    </span>
    // html template ends here
  );
};

export default Timespan;
