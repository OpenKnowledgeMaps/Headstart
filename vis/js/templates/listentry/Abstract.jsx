import React from "react";

import Highlight from "../../components/Highlight";

const Abstract = ({ text }) => {
  return (
    // html template starts here
    <p id="list_abstract">
      <Highlight queryHighlight>{text}</Highlight>
    </p>
    // html template ends here
  );
};

export default Abstract;
