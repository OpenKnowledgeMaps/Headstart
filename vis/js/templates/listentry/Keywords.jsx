import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const Keywords = ({ children: text }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div className="list_row">
      <span className="list_row_label">{localization.keywords}: </span>
      <span className="list_row_content">
        <Highlight queryHighlight>{text}</Highlight>
      </span>
    </div>
    // html template ends here
  );
};

export default Keywords;
