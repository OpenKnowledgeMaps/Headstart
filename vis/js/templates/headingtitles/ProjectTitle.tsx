// @ts-nocheck

import React from "react";

const ProjectTitle = ({ fullTitle, shortTitle, projectId }) => {
  return (
    // html template starts here
    <>
      Overview of{" "}
      <span className="truncated-project-title" title={fullTitle}>
        {shortTitle}
      </span>{" "}
      <span className="project-id">({projectId})</span>
    </>
    // html template ends here
  );
};

export default ProjectTitle;
