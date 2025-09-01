import React, { FC, ReactNode } from "react";

interface TimespanProps {
  children: ReactNode;
}

const Timespan: FC<TimespanProps> = ({ children }) => (
  <span id="timespan" className="context_item">
    {children}
  </span>
);

export default Timespan;
