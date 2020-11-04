import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const DocumentType = ({ type }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="list_resulttype" className="resulttype">
      <span id="resulttype_tag" className="resulttype_tag">
        {localization.resulttype_label}
      </span>
      <span id="resulttype_text" className="highlightable">
        {type}
      </span>
    </div>
    // html template ends here
  );
};

export default DocumentType;
