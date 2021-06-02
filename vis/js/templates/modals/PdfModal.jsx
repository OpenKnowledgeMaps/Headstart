import React, { useEffect } from "react";
import $ from "jquery";
import { Modal } from "react-bootstrap";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import usePdfLookup from "../../utils/usePdfLookup";

const PdfModal = ({ open, onClose, paper, serverUrl, service, useViewer }) => {
  const localization = useLocalizationContext();
  const [url, errorUrl] = usePdfLookup(paper, serverUrl, service);
  const viewerUrl = serverUrl + "services/displayPDF.php";

  useEffect(() => {
    $(".modal-lg.modal-dialog").draggable();
    $(".modal-lg.modal-dialog").attr("id", "pdf-modal");
  });

  return (
    // html template starts here
    <Modal id="iframe_modal" show={open} onHide={onClose} bsSize="large">
      <Modal.Header closeButton />
      <Modal.Body className="text-center">
        {url === null && (
          <div id="spinner-iframe">
            <p className="wait-message">{localization.pdf_load_text}</p>
            <p className="wait-spinner">
              <span
                id="spinner-iframe-icon"
                className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
              ></span>{" "}
            </p>
          </div>
        )}
        {!!url && (
          <iframe
            id="pdf_iframe"
            title="Document PDF preview"
            className="block"
            src={useViewer ? `${viewerUrl}?file=${url}` : url}
            frameBorder="0"
          ></iframe>
        )}
        {!!errorUrl && (
          <div className="wait-message" id="status">
            {localization.pdf_not_loaded}{" "}
            <a href={errorUrl} target="_blank" rel="noreferrer">
              {localization.pdf_not_loaded_linktext}
            </a>
            .
          </div>
        )}
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

export default PdfModal;
