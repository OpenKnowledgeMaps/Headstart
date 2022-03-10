import React from "react";
import { connect } from "react-redux";

import { Button, Modal } from "react-bootstrap";
import { hideExportPaper } from "../../actions";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import CopyButton from "../CopyButton";
import usePaperExport, {
  PAPER_EXPORT_ENDPOINT,
} from "../../utils/usePaperExport";
import useMatomo from "../../utils/useMatomo";

const ExportPaperModal = ({ open, onClose, paper, serverUrl }) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const exportContent = usePaperExport(paper, serverUrl);

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
    // html template starts here
    <Modal id="export_paper_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="export-paper-title"
          className="export-paper-modal-title"
          style={{ fontSize: 20 }}
        >
          {loc.export_paper}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {!!paper && !exportContent && (
          <div id="spinner-iframe">
            <p className="wait-message">{loc.pdf_load_text}</p>
            <p className="wait-spinner">
              <span
                id="spinner-iframe-icon"
                className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
              ></span>{" "}
            </p>
          </div>
        )}
        {(!paper || !!exportContent) && (
          <>
            <p>
              <strong className="hs-strong" style={{ fontWeight: 800 }}>BibTeX</strong>
            </p>
            <div id="copy-paper-export" className="citation code">
              {exportContent}
            </div>
            <CopyButton
              className="indented-modal-btn"
              textId={"copy-paper-export"}
              textContent={exportContent}
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
        )}
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  open: state.modals.exportedPaper !== null,
  paper: state.modals.exportedPaper,
  serverUrl: state.modals.apiProperties.headstartPath,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(hideExportPaper()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportPaperModal);

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
