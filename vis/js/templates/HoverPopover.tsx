import React, { FC, ReactNode } from "react";

import { OverlayTrigger, Popover } from "react-bootstrap";

interface HoverPopoverProps {
  id: string;
  content: string | ReactNode;
  children: ReactNode;
  container: ReactNode;
  size?: "wide";
  placement?: "bottom";
}

const HoverPopover: FC<HoverPopoverProps> = ({
  id,
  size,
  content,
  children,
  container,
  placement = "bottom",
}) => {
  const popover = (
    <Popover
      id={id}
      bsClass={(size ? size + " " : "") + "popover"}
      placement={placement}
    >
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
