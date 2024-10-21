import React from "react";

const ProjectRuntime = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    // html template starts here
    <span id="context-project_runtime" className="context_item">
      {children}
    </span>
    // html template ends here
  );
};

export default ProjectRuntime;
