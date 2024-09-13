import React from "react";

const Author = ({ bioLabel, livingDates, link, author }) => {
  return (
    // html template starts here
    <>
      {livingDates ? (
        <span id="author_living_dates" className="context_item">
          {livingDates}
        </span>
      ) : null}
      
      {bioLabel ? (
        <span id="author_bio" className="context_item">
          <a id="author_bio_link" href={link} target="_blank" rel="noreferrer">
            {bioLabel}
          </a>
        </span>
      ) : null}
    </>
    // html template ends here
  );
};

export default Author;
