import React from "react";

import { Button } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";

const EditButton = ({ onClick, title }) => {
  const { trackEvent } = useMatomo();
  const handleClick = () => {
    onClick();
    trackEvent(
      "Added components",
      "Open Viper edit modal",
      "Viper edit button"
    );
  };

  return (
    <div>
      <Button
        id="editlink"
        bsStyle="primary"
        title={title}
        onClick={handleClick}
      >
        <i className="fas fa-pencil-alt fa-fw" aria-hidden="true"></i>
      </Button>
    </div>
  );
};

export default EditButton;
