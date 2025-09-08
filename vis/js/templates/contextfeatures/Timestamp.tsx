import React, { FC } from "react";
import { PropsWithChildren } from "../../@types/common-components-props";

const Timestamp: FC<PropsWithChildren> = ({ children }) => (
  <span id="timestamp" className="context_item">
    {children}
  </span>
);

export default Timestamp;
