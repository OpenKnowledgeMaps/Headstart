import React from "react";

const StandardTitle = ({ label, title, shortTitle = title }) => {
  return (
    // html template starts here
    <>
      {label}{" "}
      <span id="search-term-unique" title={title}>
        {shortTitle}
      </span>
    </>
    // html template ends here
  );
};

export default StandardTitle;
