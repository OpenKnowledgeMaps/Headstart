import React from "react";

import Highlight from "../../components/Highlight";

const Tags = ({ values }) => {
  return (
    // html template starts here
    <div id="list_tags" class="tags">
      {values.map((tag) => (
        <div class="tag" key={tag}>
          <Highlight>{tag}</Highlight>
        </div>
      ))}
    </div>
    // html template ends here
  );
};

export default Tags;
