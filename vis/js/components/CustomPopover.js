import React from "react";

import { OverlayTrigger, Popover } from "react-bootstrap";

const CustomPopover = ({
  id,
  content,
  children,
  container, // = null
  placement = "bottom",
}) => {
  const popover = <Popover id={id}>{content}</Popover>;

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement={placement}
      overlay={popover}
      container={container}
    >
      {children}
    </OverlayTrigger>
  );
};

export default CustomPopover;
