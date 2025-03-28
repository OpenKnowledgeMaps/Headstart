// @ts-nocheck

import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

const DocTypesRow = ({ types }) => {
  const loc = useLocalizationContext();

  const typesString = types.length > 0 ? types.join(", ") : loc.unknown;

  return (
    <div className="list_row">
      <span className="list_row_label">{loc.doctypes}: </span>
      <span className="list_row_content lowercase">
        <Highlight queryHighlight>{typesString}</Highlight>
      </span>
    </div>
  );
};

export default DocTypesRow;
