import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const Abstract = ({ text }) => {
  const loc = useLocalizationContext();

  return (
    // html template starts here
    <p id="list_abstract">
      <Highlight queryHighlight>{text ? text : loc.default_abstract}</Highlight>
    </p>
    // html template ends here
  );
};

export default Abstract;
