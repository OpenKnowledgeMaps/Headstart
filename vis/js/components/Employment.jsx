import React, { useEffect, useRef, useState } from "react";
import HoverPopover from "../templates/HoverPopover";

export function Employment({ author, popoverContainer }) {
  const authorRoleId = "author-role";
  const authorOrganizationId = "author-organization";

  const authorRoleTextRef = useRef();
  const [authorRoleHasOverflow, setAuthorRoleHasOverflow] = useState(false);
  const authorOrganizationTextRef = useRef();
  const [authorOrganizationHasOverflow, setAuthorOrganizationHasOverflow] =
    useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const authorRoleText = authorRoleTextRef.current;
      
      if (!authorRoleText) {
        return;
      }
      
      if (authorRoleText && authorRoleText.scrollWidth > authorRoleText.clientWidth) {
        setAuthorRoleHasOverflow(true);
      } else {
        setAuthorRoleHasOverflow(false);
      }
      
      const authorOrganizationText = authorOrganizationTextRef.current;

      if (
        authorOrganizationText && authorOrganizationText.scrollWidth > authorOrganizationText.clientWidth
      ) {
        setAuthorOrganizationHasOverflow(true);
      } else {
        setAuthorOrganizationHasOverflow(false);
      }
    };

    // Check for overflow on load and on window resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return (
    <>
      {author?.employment?.role ? (
        <span id={authorRoleId} className="context_item shrinkable">
          {authorRoleHasOverflow ? (
            <HoverPopover
              id={`${authorRoleId}-popover`}
              container={popoverContainer}
              content={author.employment.role}
            >
              <span
                ref={authorRoleTextRef}
                className={`context_moreinfo overflow-ellipsis ${authorRoleHasOverflow ? 'has-overflow' : ''}`}
              >
                {author.employment.role}
              </span>
            </HoverPopover>
          ) : (
            <span
              ref={authorRoleTextRef}
              className="context_moreinfo overflow-ellipsis"
            >
              {author.employment.role}
            </span>
          )}
        </span>
      ) : null}

      {author?.employment?.organization ? (
        <span id={authorOrganizationId} className="context_item shrinkable">
          {authorOrganizationHasOverflow ? (
            <HoverPopover
              id={`${authorOrganizationId}-popover`}
              container={popoverContainer}
              content={author.employment.organization}
            >
              <span
                ref={authorOrganizationTextRef}
                className={`context_moreinfo overflow-ellipsis ${authorOrganizationHasOverflow ? 'has-overflow' : ''}`}
              >
                {author.employment.organization}
              </span>
            </HoverPopover>
          ) : (
            <span
              ref={authorOrganizationTextRef}
              className="context_moreinfo overflow-ellipsis"
            >
              {author.employment.organization}
            </span>
          )}
        </span>
      ) : null}
    </>
  );
}
