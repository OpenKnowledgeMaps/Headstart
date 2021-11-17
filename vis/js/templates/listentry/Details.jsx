import React from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { getAuthorsList } from "../../utils/data";

const MAX_AUTHORS_LENGTH = 100;

const Details = ({ authors, source, isSelected }) => {
  const loc = useLocalizationContext();

  const authorsList = getAuthorsList(authors);
  const authorsString = getAuthorsString(
    authorsList,
    isSelected ? Number.POSITIVE_INFINITY : MAX_AUTHORS_LENGTH
  );

  return (
    // html template starts here
    <div className="list_details">
      <div className="list_authors">
        <Highlight queryHighlight>
          {authorsString ? authorsString : loc.default_authors}
        </Highlight>
      </div>
      {!!source && (
        <div className={"list_source" + (isSelected ? "" : " short")}>
          <span className="list_in">
            <Highlight> in </Highlight>
          </span>
          <span className="list_published_in">
            <Highlight queryHighlight>{source}</Highlight>
          </span>
        </div>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isSelected: !!state.selectedPaper,
});

export default connect(mapStateToProps)(React.memo(Details));

const getAuthorsString = (authorsList, maxLength) => {
  if (!authorsList || authorsList.length === 0) {
    return "";
  }

  const ellipsis = "...";
  const join = ", ";
  let finalString = authorsList.shift();
  while (authorsList.length > 0) {
    const nextAuthor = authorsList.shift();
    let nextPossibleLength =
      finalString.length + join.length + nextAuthor.length;

    if (authorsList.length !== 0) {
      nextPossibleLength += ellipsis.length;
    }

    if (nextPossibleLength > maxLength) {
      finalString += ellipsis;
      break;
    }

    finalString += join + nextAuthor;
  }

  return finalString;
};
