import React from "react";

import Highlight from "../../components/Highlight";

const Details = ({ authors, source, year }) => {
  let sanitizedAuthors = $("<textarea />").html(authors).text();

  return (
    // html template starts here
    <div className="list_details">
      <span className="list_authors">
        <Highlight queryHighlight>{sanitizedAuthors}</Highlight>
      </span>
      {!!source && (
        <>
          <span className="list_in">
            <Highlight> in </Highlight>
          </span>
          <span className="list_published_in">
            <Highlight queryHighlight>{source}</Highlight>
          </span>
        </>
      )}
      {!!year && (
        <span className="list_pubyear">
          <Highlight queryHighlight>{` (${year})`}</Highlight>
        </span>
      )}
    </div>
    // html template ends here
  );
};

export default Details;
