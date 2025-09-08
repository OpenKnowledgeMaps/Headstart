import React, { FC } from "react";

interface TimestampProps {
  value: string;
  label: string;
}

const Timestamp: FC<TimestampProps> = ({ value, label }) => (
  <span id="timestamp" className="context_item">
    {label}: {value}
  </span>
);

export default Timestamp;
