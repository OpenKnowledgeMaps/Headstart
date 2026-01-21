import React, { FC } from "react";
import { PropsWithChildren } from "../../types";

const ProjectRuntime: FC<PropsWithChildren> = ({ children }) => (
  <span id="context-project_runtime" className="context_item">
    {children}
  </span>
);

export default ProjectRuntime;
