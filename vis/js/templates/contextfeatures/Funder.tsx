import React, { FC, ReactNode } from "react";

interface FunderProps {
  children: ReactNode;
}

const Funder: FC<FunderProps> = ({ children }) => (
  <span id="context-funder" className="context_item">
    Funder: {children}
  </span>
);

export default Funder;
