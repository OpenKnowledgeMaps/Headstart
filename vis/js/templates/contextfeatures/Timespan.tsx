import React, { FC } from "react";
import { PropsWithChildren } from "../../@types/common-components-props";

const Timespan: FC<PropsWithChildren> = ({ children }) => (
  <span id="timespan" className="context_item">
    {children}
  </span>
);

export default Timespan;
