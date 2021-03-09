import React from "react";

import { Modal } from "react-bootstrap";

import viperEditScreenshot from "../../../images/viper-project-screenshot.png";
import { useLocalizationContext } from "../../components/LocalizationProvider";

const ViperEditModal = ({ open, onClose, acronym, title, objectID }) => {
  const localization = useLocalizationContext();

  const pageTitle = (acronym !== "" ? acronym + " - " : "") + title;
  const buttonLabel = localization.viper_button_desc_label.replace(/^<p>/, "");

  const handleClick = (event) => {
    event.preventDefault();
    window.open(`https://www.openaire.eu/search/project?projectId=${objectID}`);
  };

  return (
    // html template starts here
    <Modal id="viper_edit_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="edit-title"
          className="embed-modal-title"
          style={{ fontSize: 20 }}
        >
          {localization.viper_edit_title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="edit-body" className="modal-body">
        <div
          id="edit-modal-text"
          dangerouslySetInnerHTML={{
            __html: localization.viper_edit_desc_label,
          }}
        />

        <a className="viper-edit-link" target="_blank">
          <img
            id="viper-edit-screenshot"
            alt="OpenAire Project Page Screenshot"
            src={viperEditScreenshot}
            onClick={handleClick}
          />
        </a>

        <div id="edit-button-text">
          <p>
            {buttonLabel} <b>{pageTitle}</b>.
          </p>
        </div>
        <a
          className="btn btn-primary viper-edit-link"
          id="viper-edit-button"
          target="_blank"
          onClick={handleClick}
        >
          {localization.viper_edit_button_text}
        </a>
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

export default ViperEditModal;
