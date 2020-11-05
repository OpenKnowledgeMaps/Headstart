import React from "react";

import Highlight from "../../components/Highlight";

const Tags = ({ values }) => {
  return (
    // html template starts here
    <div id="list_tags" className="tags" style={{ display: "inline-block" }}>
      {values.map((tag) => (
        <div className="tag" key={tag}>
          <Highlight>{tag}</Highlight>
        </div>
      ))}
    </div>
    // html template ends here
  );
};

export default Tags;
