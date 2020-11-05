import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const Classification = ({ children }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="list_basic_classification">
      <span className="keyword_tag">{localization.basic_classification}: </span>
      <span className="keywords">
        <Highlight>{children}</Highlight>
      </span>
    </div>
    // html template ends here
  );
};

export default Classification;
