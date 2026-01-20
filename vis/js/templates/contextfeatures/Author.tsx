import React, { FC, memo } from "react";

interface AuthorProps {
  bioLabel?: string;
  livingDates?: string;
}

export const Author: FC<AuthorProps> = memo(({ bioLabel, livingDates }) => (
  <>
    {livingDates ? (
      <span id="author_living_dates" className="context_item">
        {livingDates}
      </span>
    ) : null}

    {bioLabel ? (
      <span id="author_bio" className="context_item">
        <a id="author_bio_link" target="_blank" rel="noreferrer">
          {bioLabel}
        </a>
      </span>
    ) : null}
  </>
));
