import React from "react";

const Funder = ({ children: value }) => {
  return (
    // html template starts here
    <span id="context-funder" className="context_item">
      Funder: {value}
    </span>
    // html template ends here
  );
};

export default Funder;
