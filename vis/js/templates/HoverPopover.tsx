// @ts-nocheck

import React from "react";

import { OverlayTrigger, Popover } from "react-bootstrap";

const HoverPopover = ({
  id,
  size,
  content,
  children,
  container, // = null
  placement = "bottom",
}) => {
  const popover = (
    <Popover id={id} bsClass={(size ? size + " " : "") + "popover"} placement={placement}>
      {content}
    </Popover>
  );

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

export default HoverPopover;
