import React from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";

const MAX_AUTHORS_LENGTH = 100;

const Details = ({authors, source, isSelected}) => {
  const loc = useLocalizationContext();

  const authorsString = getAuthorsString(
      authors,
      isSelected ? Number.POSITIVE_INFINITY : MAX_AUTHORS_LENGTH
  );

  // console.log("Details.jsx: authorsString: ", authorsString);
  console.log("Details.jsx: loc.default_authors: ", loc.default_authors);

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


  const authorsListCopy = [...authorsList];

  const ellipsis = "...";
  const join = ", ";
  const maxLengthAuthors = 15;
  let finalString = authorsListCopy.shift();
  if (authorsList.length > maxLengthAuthors) {
    const firstAuthors = authorsList.slice(0, maxLengthAuthors - 1).join(join);
    const lastAuthor = authorsList[authorsList.length - 1];
    finalString = `${firstAuthors}, ... ${lastAuthor}`;
    return finalString;
  }
  while (authorsListCopy.length > 0) {
    const nextAuthor = authorsListCopy.shift();
    let nextPossibleLength =
        finalString.length + join.length + nextAuthor.length;

    if (authorsListCopy.length !== 0) {
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
