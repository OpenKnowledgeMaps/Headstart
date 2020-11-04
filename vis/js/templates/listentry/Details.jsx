import React from "react";

const Details = ({ authors, source, year }) => {
  return (
    // html template starts here
    <div className="list_details highlightable">
      <span
        className="list_authors"
        dangerouslySetInnerHTML={{ __html: authors }}
      ></span>
      {!!source && (
        <>
          <span className="list_in"> in </span>
          <span className="list_published_in">{source}</span>
        </>
      )}
      {!!year && <span className="list_pubyear"> ({year})</span>}
    </div>
    // html template ends here
  );
};

export default Details;
