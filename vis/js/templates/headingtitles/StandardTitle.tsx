import React from "react";

interface StandardTitleProps {
  label: string;
  title: string;
  shortTitle?: string;
}

const StandardTitle = ({ label, title, shortTitle = title }: StandardTitleProps) => {
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
