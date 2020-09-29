import React from "react";

const PaperCount = ({ value, label }) => {
  return (
    // html template starts here
    <span id="context-paper_count" className="context_item">
      {value} {label}
    </span>
    // html template ends here
  );
};

export default PaperCount;
