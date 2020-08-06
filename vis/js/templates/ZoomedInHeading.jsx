import React from "react";

// TODO remove the dangerouslySetInnerHTML when we know where the title comes from
const ZoomedInHeading = ({ label, title }) => {
  return (
    // html template starts here
    <h4>
      <span id="area-bold">{label}:</span>{" "}
      <span
        id="area-not-bold"
        dangerouslySetInnerHTML={{ __html: title }}
      ></span>
    </h4>
    // html template ends here
  );
};

export default ZoomedInHeading;
