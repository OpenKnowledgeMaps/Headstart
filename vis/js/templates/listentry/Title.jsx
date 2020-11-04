import React from "react";

const Title = ({ children, onClick }) => {
  return (
    // html template starts here
    <div className="list_title" onClick={onClick}>
      <a id="paper_list_title" className="highlightable">
        {children}
      </a>
    </div>
    // html template ends here
  );
};

export default Title;
