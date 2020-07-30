import React from "react";

const ZoomedInHeading = ({ label, title }) => {
  return (
    // html template starts here
    <h4>
      <span id="area-bold">{label}</span>
      <span id="area-not-bold">{title}</span>
    </h4>
    // html template ends here
  );
};

export default ZoomedInHeading;
