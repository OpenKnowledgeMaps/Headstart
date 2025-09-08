import React, { FC } from "react";

interface TimestampProps {
  value: string;
}

const Timestamp: FC<TimestampProps> = ({ value }) => (
  <span
    style={{ outline: "1px solid red" }}
    id="timestamp"
    className="context_item"
  >
    {value}
  </span>
);

export default Timestamp;
