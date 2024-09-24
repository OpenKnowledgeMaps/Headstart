import React from "react";
import HoverPopover from '../templates/HoverPopover';

export function Employment({ author }) {
  return (
    <>
      {author?.employment?.role ? (
        <HoverPopover
          id="author_role_popover"
          content={author.employment.role}
        >
          <span
            id="author_role"
            className="context_item"
          >
            <span className="context_moreinfo overflow-ellipsis">
              {author.employment.role}
            </span>
          </span>
        </HoverPopover>
      ) : null}

      {author?.employment?.organization ? (
        <HoverPopover
          id="author_organization_popover"
          content={author.employment.organization}
        >
          <span
            id="author_organization"
            className="context_item"
          >
            <span className="context_moreinfo overflow-ellipsis">
              {author.employment.organization}
            </span>
          </span>
        </HoverPopover>
      ) : null}
    </>
  );
}