import React, { FC } from "react";

interface DatasetCountProps {
  value: string;
  label: string;
}

const DatasetCount: FC<DatasetCountProps> = ({ value, label }) => (
  <span id="context-dataset_count" className="context_item">
    {value} {label}
  </span>
);

export default DatasetCount;
