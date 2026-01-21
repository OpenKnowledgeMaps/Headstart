import React, { FC, ReactNode } from "react";
import HoverPopover from "../templates/HoverPopover";
import { Author } from "../types";
import { shorten } from "../utils/string";

const MAX_ROLE_LENGTH = 18;

interface EmploymentProps {
  author: Author;
  popoverContainer: ReactNode;
}

export const Employment: FC<EmploymentProps> = ({
  author,
  popoverContainer,
}) => {
  const authorRoleId = "author-role";
  const authorOrganizationId = "author-organization";

  const role = author?.employment?.role || "";
  const shortenedRole = shorten(role, MAX_ROLE_LENGTH);
  const authorRoleHasOverflow =
    shortenedRole && shortenedRole !== author?.employment?.role;

  const organization = author?.employment?.organization || "";
  const shortenedOrganization = shorten(organization, MAX_ROLE_LENGTH);
  const authorOrganizationHasOverflow =
    shortenedOrganization &&
    shortenedOrganization !== author?.employment?.organization;

  return (
    <>
      {author?.employment?.role ? (
        <span id={authorRoleId} className="context_item shrinkable">
          {authorRoleHasOverflow ? (
            <HoverPopover
              id={`${authorRoleId}-popover`}
              container={popoverContainer}
              content={role}
            >
              <span
                className={`context_moreinfo overflow-ellipsis ${
                  authorRoleHasOverflow ? "has-overflow" : ""
                }`}
              >
                {shortenedRole}
              </span>
            </HoverPopover>
          ) : (
            <span className="context_moreinfo overflow-ellipsis">
              {shortenedRole}
            </span>
          )}
        </span>
      ) : null}

      {shortenedOrganization ? (
        <span id={authorOrganizationId} className="context_item shrinkable">
          {authorOrganizationHasOverflow ? (
            <HoverPopover
              id={`${authorOrganizationId}-popover`}
              container={popoverContainer}
              content={organization}
            >
              <span
                className={`context_moreinfo overflow-ellipsis ${
                  authorOrganizationHasOverflow ? "has-overflow" : ""
                }`}
              >
                {shortenedOrganization}
              </span>
            </HoverPopover>
          ) : (
            <span className="context_moreinfo overflow-ellipsis">
              {shortenedOrganization}
            </span>
          )}
        </span>
      ) : null}
    </>
  );
};
