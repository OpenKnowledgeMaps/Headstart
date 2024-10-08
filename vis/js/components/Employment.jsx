import React from "react";
import HoverPopover from "../templates/HoverPopover";

export function Employment({ author, popoverContainer }) {
  return (
    <>
      {author?.employment?.role ? (
        <span id="author-role" className="context_item">
          <HoverPopover
            id="author-role-popover"
            container={popoverContainer}
            content={author.employment.role}
          >
            <span className="context_moreinfo overflow-ellipsis">
              {author.employment.role}
            </span>
          </HoverPopover>
        </span>
      ) : null}

      {author?.employment?.organization ? (
        <span id="author-organization" className="context_item">
          <HoverPopover
            id="author-organization-popover"
            container={popoverContainer}
            content={author.employment.organization}
          >
            <span className="context_moreinfo overflow-ellipsis">
              {author.employment.organization}
            </span>
          </HoverPopover>
        </span>
      ) : null}
    </>
  );
}
