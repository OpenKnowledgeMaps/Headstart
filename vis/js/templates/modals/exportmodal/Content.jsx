import React from "react";

import { Button } from "react-bootstrap";

import { useLocalizationContext } from "../../../components/LocalizationProvider";
import CopyButton from "../../CopyButton";
import useMatomo from "../../../utils/useMatomo";
import { PAPER_EXPORT_ENDPOINT } from "../../../utils/usePaperExport";

const Content = ({ paper, serverUrl, children }) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleCopyClick = () => {
    trackEvent("List document", "Copy paper export", "Copy export button");
  };

  const handleDownloadClick = () => {
    startExportDownload(paper, serverUrl);
    trackEvent(
      "List document",
      "Download paper export",
      "Download export button"
    );
  };

  return (
    <>
      <p>
        <strong className="hs-strong" style={{ fontWeight: 800 }}>
          BibTeX
        </strong>
      </p>
      <div id="copy-paper-export" className="citation code">
        {children}
      </div>
      <CopyButton
        className="indented-modal-btn"
        textId={"copy-paper-export"}
        textContent={children}
        onClick={handleCopyClick}
      />
      <Button
        className="indented-modal-btn"
        bsStyle="primary"
        onClick={handleDownloadClick}
      >
        <i className="fa fa-download"></i>
        &nbsp;&nbsp;{loc.download}
      </Button>
    </>
  );
};

export default Content;

// the alternative solution is to really create a form in the JSX
const startExportDownload = (paper, serverUrl) => {
  const url = serverUrl + PAPER_EXPORT_ENDPOINT + "&download=true";

  const form = document.createElement("form");

  form.setAttribute("method", "post");
  form.setAttribute("action", url);
  form.setAttribute("target", "_blank");

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "paper";
  input.value = JSON.stringify(paper);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
