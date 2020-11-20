import React from "react";

import Highlight from "../../components/Highlight";

const Title = ({ children, onClick }) => {
  return (
    // html template starts here
    <div className="list_title" onClick={onClick}>
      <a id="paper_list_title">
        <Highlight queryHighlight>{children}</Highlight>
      </a>
    </div>
    // html template ends here
  );
};

export default Title;
