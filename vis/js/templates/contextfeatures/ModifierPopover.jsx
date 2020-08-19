import React from "react";

// these are the Bootstrap 3 components
// https://react-bootstrap-v3.netlify.app/
import { OverlayTrigger, Popover } from "react-bootstrap";

const ModifierPopover = ({ label, text, container }) => {
  const popover = <Popover id="modifier-popover">{text}</Popover>;

  return (
    // html template starts here
    <>
      <OverlayTrigger trigger={["hover", "focus"]} placement="bottom" overlay={popover} container={container}>
        <span id="modifier" className="modifier context_moreinfo">
          {label}
        </span>
      </OverlayTrigger>{" "}
    </>
    // html template ends here
  );
};

export default ModifierPopover;
