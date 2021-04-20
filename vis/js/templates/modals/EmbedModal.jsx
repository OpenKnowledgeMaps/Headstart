import React, { useRef } from "react";

import { Modal, Button } from "react-bootstrap";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const IFRAME_WIDTH = 1260;
const IFRAME_HEIGHT = 756;

const EmbedModal = ({ open, onClose }) => {
  const localization = useLocalizationContext();

  const embedText = `<iframe width="${IFRAME_WIDTH}" height="${IFRAME_HEIGHT}" src="${window.location
    .toString()
    .replace(/#.*/, "")}&embed=true"></iframe>`;

  const areaRef = useRef(null);
  const handleCopyClick = (event) => {
    event.preventDefault();
    const embedString = areaRef.current;
    embedString.focus();
    embedString.setSelectionRange(0, embedString.value.length);
    document.execCommand("copy");
    return false;
  };

  return (
    // html template starts here
    <Modal id="embed_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="embed-title"
          className="embed-modal-title"
          style={{ fontSize: 20 }}
        >
          {localization.embed_title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="embed-body" className="modal-body">
        <p id="embed-body-text">{localization.embed_body_text}</p>
        <form>
          <textarea
            ref={areaRef}
            id="embed-modal-text"
            rows="3"
            readOnly
            value={embedText}
          ></textarea>
          <Button bsStyle="primary" id="embed-button" onClick={handleCopyClick}>
            {localization.embed_button_text}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

export default EmbedModal;
