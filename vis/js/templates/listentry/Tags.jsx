import React from "react";

const Tags = ({ values }) => {
  return (
    // html template starts here
    <div id="list_tags" class="tags highlightable">
      {values.map((tag) => (
        <div class="tag" key={tag}>
          {tag}
        </div>
      ))}
    </div>
    // html template ends here
  );
};

export default Tags;
