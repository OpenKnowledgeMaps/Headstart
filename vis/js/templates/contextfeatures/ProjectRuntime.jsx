import React from "react";

const ProjectRuntime = ({ children: value }) => {
  return (
    // html template starts here
    <span id="context-project_runtime" className="context_item">
      {value}
    </span>
    // html template ends here
  );
};

export default ProjectRuntime;
