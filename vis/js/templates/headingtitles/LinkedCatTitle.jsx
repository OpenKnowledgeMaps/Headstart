import React from "react";

const LinkedCatTitle = ({ label, fullTitle, shortTitle }) => {
  return (
    // html template starts here
    <>
      {label}{" "}
      <span id="search-term-unique" title={fullTitle}>
        {shortTitle}
      </span>{" "}
    </>
    // html template ends here
  );
};

export default LinkedCatTitle;
