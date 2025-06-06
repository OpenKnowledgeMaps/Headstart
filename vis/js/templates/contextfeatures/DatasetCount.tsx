import React from "react";

const DatasetCount = ({ value, label }: {
  value: string;
  label: string;
}) => {
  return (
    // html template starts here
    <span id="context-dataset_count" className="context_item">
      {value} {label}
    </span>
    // html template ends here
  );
};

export default DatasetCount;
