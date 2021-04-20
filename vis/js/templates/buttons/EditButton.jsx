import React from "react";

import { Button } from "react-bootstrap";

const EditButton = ({ onClick, title }) => {
  return (
    <div>
      <Button
        id="editlink"
        bsStyle="primary"
        title={title}
        onClick={onClick}
      >
        <i className="fa fa-pencil fa-fw" aria-hidden="true"></i>
      </Button>
    </div>
  );
};

export default EditButton;
