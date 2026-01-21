import React, { FC } from "react";
import { connect } from "react-redux";
import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { State } from "../../types";

const MAX_AUTHORS_LENGTH = 100;

interface DetailsProps {
  authors: string[];
  source: string;
  isSelected: boolean;
}

const Details: FC<DetailsProps> = ({ authors, source, isSelected }) => {
  const loc = useLocalizationContext();

  const authorsString = getAuthorsString(
    authors,
    isSelected ? Number.POSITIVE_INFINITY : MAX_AUTHORS_LENGTH,
  );

  return (
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
  );
};

const mapStateToProps = (state: State) => ({
  isSelected: !!state.selectedPaper,
});

export default connect(mapStateToProps)(React.memo(Details));

const getAuthorsString = (authorsList: string[], maxLength: number) => {
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
      finalString!.length + join.length + nextAuthor!.length;

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
