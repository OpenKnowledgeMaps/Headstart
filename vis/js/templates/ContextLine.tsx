import React, { FC } from "react";
import { PropsWithChildren } from "../types";

export const ContextLineTemplate: FC<PropsWithChildren> = ({ children }) => (
  <p id="context" data-testid="context">
    {children}
  </p>
);
