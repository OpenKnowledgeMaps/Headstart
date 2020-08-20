import React from "react";

const DatasetCount = ({ value, label }) => {
  return (
    // html template starts here
    <span id="context-dataset_count">
      {value} {label}
    </span>
    // html template ends here
  );
};

export default DatasetCount;
