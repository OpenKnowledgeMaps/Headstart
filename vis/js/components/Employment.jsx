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
            className="overflow-ellipsis underscore"
          >
            {author.employment.role}
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
            className="overflow-ellipsis underscore"
          >
            {author.employment.organization}
          </span>
        </HoverPopover>
      ) : null}
    </>
  );
}