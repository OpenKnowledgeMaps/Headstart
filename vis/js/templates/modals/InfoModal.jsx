import React, { useEffect } from "react";
import $ from "jquery"
import { Modal } from "react-bootstrap";

const InfoModal = ({ open, onClose, title, body, params }) => {
  // necessary for dynamic modals (Viper)
  useEffect(() => {
    if (params) {
      requestAnimationFrame(() => {
        Object.keys(params).forEach((paramName) => {
          if (paramName.slice(0, 4) === "html") {
            $(".info-modal-" + paramName).html(params[paramName]);
          } else {
            const value =
              params[paramName] === "true" ? "yes" : params[paramName];
            $(".info-modal-" + paramName).text(value);
          }
        });
      });
    }
  }, [params, open]);

  return (
    // html template starts here
    <Modal id="info_modal" show={open} onHide={onClose} animation>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body" dangerouslySetInnerHTML={{ __html: body }} />
    </Modal>
    // html template ends here
  );
};

export default InfoModal;
