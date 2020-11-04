import React from "react";

const Abstract = ({ text }) => {
  return (
    // html template starts here
    <div className="highlightable">
      <p id="list_abstract">{text}</p>
    </div>
    // html template ends here
  );
};

export default Abstract;
