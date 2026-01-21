import React, { FC, ReactNode } from "react";
import { shorten } from "../../utils/string";
import HoverPopover from "../HoverPopover";

const MAX_CONTENT_PROVIDER_LENGTH = 6;

interface DataSourceProps {
  label: string;
  source: string;
  contentProvider?: string;
  popoverContainer: ReactNode;
}

const DataSource: FC<DataSourceProps> = ({
  label,
  source,
  contentProvider,
  popoverContainer,
}) => {
  if (contentProvider) {
    const content = shorten(contentProvider, MAX_CONTENT_PROVIDER_LENGTH);

    return (
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
    );
  }

  return (
    <span
      id="source"
      className="context_item"
      dangerouslySetInnerHTML={{
        __html: `${label}: ${source}`,
      }}
    ></span>
  );
};

export default DataSource;
