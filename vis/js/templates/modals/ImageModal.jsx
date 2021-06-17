import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import $ from "jquery";

import { isFileAvailable } from "../../utils/data";

const ImageModal = ({ open, onClose, paperID }) => {
  const [images, setImages] = useState(null);

  useEffect(() => {
    const loadAllPages = () => {
      const images = [];
      let page = 1;
      let hasNextPage = true;
      
      do {
        const imageURL = "paper_preview/" + paperID + "/page_" + page + ".png";
        // TODO make this async
        if (isFileAvailable(imageURL)) {
          images.push({ page, url: imageURL });
          page++;
        } else {
          hasNextPage = false;
        }
      } while(hasNextPage);

      setImages(images);
    };

    setImages(null);
    if (paperID) {
      loadAllPages();
    }
  }, [paperID, setImages]);

  useEffect(() => {
    $(".modal-lg.modal-dialog").draggable();
  });

  return (
    // html template starts here
    <Modal id="images_modal" show={open} onHide={onClose} bsSize="large">
      <Modal.Header closeButton />
      <Modal.Body className="text-center">
        {!images && (
          <span
            id="spinner-images"
            className="glyphicon glyphicon-refresh glyphicon-refresh-animate"
          ></span>
        )}
        {!!images && (
          <div id="images_holder" className="block">
            {images.map((image) => (
              <React.Fragment key={image.url}>
                <div id="preview_page_index">Page {image.page}</div>
                <img
                  id="preview_page"
                  src={image.url}
                  alt={"Preview of page " + image.page}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

export default ImageModal;
