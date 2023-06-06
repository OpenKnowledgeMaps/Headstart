import React from "react";

import { Modal } from "react-bootstrap";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { addEmbedParam } from "../../utils/string";
import useMatomo from "../../utils/useMatomo";

import CopyButton from "../CopyButton";

const IFRAME_WIDTH = 1260;
const IFRAME_HEIGHT = 756;

const EmbedModal = ({ open, onClose }) => {
    const loc = useLocalizationContext();
    const {trackEvent} = useMatomo();

    const trackCopyClick = () => {
        trackEvent("Added components", "Copy embed", "Copy embed button");
    };

    const embedUrl = addEmbedParam(window.location.toString().replace(/#.*/, ""));
    // add allow="clipboard-write; self https://openknowledgemaps.org/;"
    const embedText = `<iframe width="${IFRAME_WIDTH}" height="${IFRAME_HEIGHT}" src="${embedUrl}" 
                                allow="clipboard-write; self https://openknowledgemaps.org/;"></iframe>`;

    return (
        // html template starts here
        <Modal id="embed_modal" show={open} onHide={onClose}>
            <Modal.Header closeButton className="modal-header">
                <Modal.Title
                    id="embed-title"
                    className="embed-modal-title"
                    style={{fontSize: 20}}
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
                    onClick={trackCopyClick}
                />
            </Modal.Body>
        </Modal>
        // html template ends here
    );
};

export default EmbedModal;
