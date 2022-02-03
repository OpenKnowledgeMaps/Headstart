import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

import { useLocalizationContext } from "../components/LocalizationProvider";
import selectText from "../utils/selectText";

const CopyButton = ({ id, className = "", textId, textContent }) => {
  const loc = useLocalizationContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [textId, textContent]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(textContent).then(() => {
      selectText(textId);
      setCopied(true);
    });
  };

  return (
    <Button
      id={id}
      className={className + " " + (copied ? "copied-button" : "copy-button")}
      bsStyle="primary"
      onClick={handleCopyClick}
    >
      <i className="fa fa-copy"></i>
      &nbsp;&nbsp;
      {copied ? loc.copied_button_text : loc.embed_button_text}
    </Button>
  );
};

export default CopyButton;
