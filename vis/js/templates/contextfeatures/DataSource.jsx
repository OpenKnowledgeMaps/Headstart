import React from "react";
import { shorten } from "../../utils/string";
import HoverPopover from "../HoverPopover";

const MAX_CONTENT_PROVIDER_LENGTH = 6;

const DataSource = ({ label, source, contentProvider, popoverContainer }) => {
  if (contentProvider) {
    const content = shorten(contentProvider, MAX_CONTENT_PROVIDER_LENGTH);

    return (
      // html template starts here
      <span id="source" className="context_item">
        {label}:{" "}
        <HoverPopover
          id="doctypes-popover"
          container={popoverContainer}
          content={`${contentProvider} (via ${source})`}
        >
          <span className="context_moreinfo">{content}</span>
        </HoverPopover>
      </span>
      // html template ends here
    );
  }

  return (
    // html template starts here
    <span
      id="source"
      className="context_item"
      dangerouslySetInnerHTML={{
        __html: `${label}: ${source}`,
      }}
    ></span>
    // html template ends here
  );
};

export default DataSource;
