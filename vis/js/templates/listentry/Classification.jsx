import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const Classification = ({ children }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="list_basic_classification">
      <span className="keyword_tag">{localization.basic_classification}: </span>
      <span className="keywords highlightable">{children}</span>
    </div>
    // html template ends here
  );
};

export default Classification;
