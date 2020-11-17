import React from "react";

import Highlight from "../../components/Highlight";

const Abstract = ({ text }) => {
  let sanitizedText = $("<textarea />").html(text).text();

  return (
    // html template starts here
    <p id="list_abstract">
      <Highlight queryHighlight>{sanitizedText}</Highlight>
    </p>
    // html template ends here
  );
};

export default Abstract;
