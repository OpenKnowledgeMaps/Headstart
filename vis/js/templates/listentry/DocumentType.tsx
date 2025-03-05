// @ts-nocheck

import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

interface DocumentTypeProps {
  type: string;
}

const DocumentType = ({ type }: DocumentTypeProps) => {
  const localization = useLocalizationContext();

  return (
    <div id="list_resulttype" className="resulttype">
      <span id="resulttype_tag" className="resulttype_tag">
        {localization.resulttype_label}:{" "}
      </span>
      <span id="resulttype_text">
        <Highlight>{type}</Highlight>
      </span>
    </div>
  );
};

export default DocumentType;
