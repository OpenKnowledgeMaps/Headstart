// @ts-nocheck

import React from "react";

const CustomTitle = ({ label, title, query, explanation }) => {
  return (
    // html template starts here
    <>
      {label}{" "}
      <span id="search-term-unique" title={`${explanation} ${query}`}>
        {title}
      </span>
    </>
    // html template ends here
  );
};

export default CustomTitle;
