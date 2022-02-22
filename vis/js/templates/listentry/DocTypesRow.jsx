import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const Keywords = ({ types }) => {
  const loc = useLocalizationContext();

  const typesString = types.length > 0 ? types.join(", ") : loc.unknown;

  return (
    // html template starts here
    <div className="list_row">
      <span className="list_row_label">{loc.doctypes}: </span>
      <span className="list_row_content">
        <Highlight queryHighlight>{typesString}</Highlight>
      </span>
    </div>
    // html template ends here
  );
};

export default Keywords;
