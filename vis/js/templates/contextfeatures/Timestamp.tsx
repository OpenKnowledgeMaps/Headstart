import React, { FC } from "react";

interface TimestampProps {
  label: string;
  value: string;
}

const Timestamp: FC<TimestampProps> = ({ label, value }) => (
  <span id="timestamp" className="context_item">
    {label}: {value}
  </span>
);

export default Timestamp;
