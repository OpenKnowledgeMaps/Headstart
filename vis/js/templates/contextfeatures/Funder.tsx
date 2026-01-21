import React, { FC } from "react";
import { PropsWithChildren } from "../../types";

const Funder: FC<PropsWithChildren> = ({ children }) => (
  <span id="context-funder" className="context_item">
    Funder: {children}
  </span>
);

export default Funder;
