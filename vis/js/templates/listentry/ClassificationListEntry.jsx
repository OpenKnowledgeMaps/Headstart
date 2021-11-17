import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import {
  getPaperClassification,
  getPaperKeywords,
  getPaperTextLink,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import { shorten } from "../../utils/string";
import PaperButtons from "../PaperButtons";

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
  linkType,
  abstractSize,
  isStreamgraph,
  showBacklink,
  isInStreamBacklink,
  handleBacklinkClick,
}) => {
  const loc = useLocalizationContext();

  const id = paper.safe_id;
  const access = {
    isOpenAccess: !!paper.oa,
    isFreeAccess: !!paper.free_access,
    isDataset: paper.resulttype === "dataset",
  };
  const link = getPaperTextLink(paper, linkType);
  const classification = getPaperClassification(paper, loc);
  const abstract = abstractSize
    ? shorten(paper.paper_abstract, abstractSize)
    : paper.paper_abstract;
  const keywords = getPaperKeywords(paper, loc);
  const backlink = {
    show: showBacklink,
    isInStream: isInStreamBacklink,
    onClick: () => handleBacklinkClick(),
  };

  return (
    // html template starts here
    <ListEntry anchorId={id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={access.isOpenAccess}
          isFreeAccess={access.isFreeAccess}
          isDataset={access.isDataset}
        />
        <Title paper={paper} />
        <Details
          authors={
            paper.authors_string ? paper.authors_string : loc.default_authors
          }
          source={paper.published_in}
        />
        <Link address={link.address} isDoi={link.isDoi} />
      </div>
      <Classification>{classification}</Classification>
      <Keywords>{keywords}</Keywords>
      <Abstract text={abstract} />
      <PaperButtons paper={paper} />
      {!isStreamgraph && <Area paper={paper} />}
      {!!backlink.show && (
        <EntryBacklink
          onClick={backlink.onClick}
          isInStream={backlink.isInStream}
        />
      )}
    </ListEntry>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  linkType: state.list.linkType,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ClassificationListEntry);
