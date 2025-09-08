import React, { FC, ReactNode } from "react";

interface ProjectRuntimeProps {
  children: ReactNode;
}

const ProjectRuntime: FC<ProjectRuntimeProps> = ({ children }) => (
  <span id="context-project_runtime" className="context_item">
    {children}
  </span>
);

export default ProjectRuntime;
