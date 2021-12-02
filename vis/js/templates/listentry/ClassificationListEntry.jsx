import React from "react";
import { connect } from "react-redux";

import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import PaperButtons from "./PaperButtons";

import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Classification from "./Classification";
import Details from "./Details";
import EntryBacklink from "./EntryBacklink";
import Keywords from "./Keywords";
import Link from "./Link";
import ListEntry from "./ListEntry";
import Title from "./Title";

/**
 * List entry template used in LinkedCat.
 * @param {Object} props
 */
const ClassificationListEntry = ({
  paper,
  isStreamgraph,
  showBacklink,
  isInStreamBacklink,
  handleBacklinkClick,
}) => {
  return (
    // html template starts here
    <ListEntry anchorId={paper.safe_id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={!!paper.oa}
          isFreeAccess={!!paper.free_access}
          isDataset={paper.resulttype === "dataset"}
        />
        <Title paper={paper} />
        <Details authors={paper.authors_list} source={paper.published_in} />
        <Link address={paper.list_link.address} isDoi={paper.list_link.isDoi} />
      </div>
      <Classification>{paper.classification}</Classification>
      <Keywords>{paper.keywords}</Keywords>
      <Abstract text={paper.paper_abstract} />
      <PaperButtons paper={paper} />
      {!isStreamgraph && <Area paper={paper} />}
      {showBacklink && (
        <EntryBacklink
          onClick={handleBacklinkClick}
          isInStream={isInStreamBacklink}
        />
      )}
    </ListEntry>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ClassificationListEntry);
