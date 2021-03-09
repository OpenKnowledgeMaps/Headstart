import React from "react";

import { Button } from "react-bootstrap";

const FAQsButton = ({ url }) => {
  const handleClick = () => {
    window.open(url, "_blank");
  };

  // title and label not localized in the old code
  return (
    <div>
      <Button
        id="faqs_button"
        className="sharebutton"
        bsStyle="primary"
        title="check out our faqs"
        style={{ fontSize: 12 }}
        onClick={handleClick}
      >
        FAQs
      </Button>
    </div>
  );
};

export default FAQsButton;
