import React from "react";

import { Modal } from "react-bootstrap";

import { useLocalizationContext } from "../../components/LocalizationProvider";

import CopyButton from "../CopyButton";

const IFRAME_WIDTH = 1260;
const IFRAME_HEIGHT = 756;

const EmbedModal = ({ open, onClose }) => {
  const loc = useLocalizationContext();

  const embedText = `<iframe width="${IFRAME_WIDTH}" height="${IFRAME_HEIGHT}" src="${window.location
    .toString()
    .replace(/#.*/, "")}&embed=true"></iframe>`;

  return (
    // html template starts here
    <Modal id="embed_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="embed-title"
          className="embed-modal-title"
          style={{ fontSize: 20 }}
        >
          {loc.embed_title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="embed-body" className="modal-body">
        <p id="embed-body-text">{loc.embed_body_text}</p>
        <div id="copy-embed" className="citation">
          {embedText}
        </div>
        <CopyButton
          className="indented-modal-btn"
          textId={"copy-embed"}
          textContent={open ? embedText : ""}
        />
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

export default EmbedModal;
