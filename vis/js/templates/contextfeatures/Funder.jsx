import React from "react";

const Funder = ({ children: value }) => {
  return (
    // html template starts here
    <span id="context-funder">Funder: {value}</span>
    // html template ends here
  );
};

export default Funder;
