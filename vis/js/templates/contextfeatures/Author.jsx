import React from "react";

const Author = ({ bioLabel, livingDates, link }) => {
  return (
    // html template starts here
    <>
      <span id="author_living_dates">{livingDates}</span>
      <span id="author_bio">
        <a id="author_bio_link" target="_blank" href={link}>
          {bioLabel}
        </a>
      </span>
    </>
    // html template ends here
  );
};

export default Author;
