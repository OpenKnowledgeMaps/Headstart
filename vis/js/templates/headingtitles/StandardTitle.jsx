import React from "react";

const StandardTitle = ({ label, title }) => {
  return (
    // html template starts here
    <>
      {label}{" "}
      <span id="search-term-unique" title={title}>
        {title}
      </span>
    </>
    // html template ends here
  );
};

export default StandardTitle;
