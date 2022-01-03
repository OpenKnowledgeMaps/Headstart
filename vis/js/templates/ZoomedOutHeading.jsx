import React from "react";

const ZoomedOutHeading = ({ children: title }) => {
  return (
    // html template starts here
    <div className="heading-container">
      <h4 className="heading">{title}</h4>
    </div>
    // html template ends here
  );
};

export default ZoomedOutHeading;
