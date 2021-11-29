import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import {
  getPaperComments,
  getPaperKeywords,
  getPaperTags,
  getPaperTextLink,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import PaperButtons from "./PaperButtons";

import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Citations from "./Citations";
import Comments from "./Comments";
import Details from "./Details";
import DocumentType from "./DocumentType";
import EntryBacklink from "./EntryBacklink";
import Keywords from "./Keywords";
import Link from "./Link";
import ListEntry from "./ListEntry";
import Metrics from "./Metrics";
import Tags from "./Tags";
import Title from "./Title";

/**
 * Standard list entry template used in project website, CoVis and Viper.
 * @param {Object} props
 */
const StandardListEntry = ({
  // data
  paper,
  linkType,
  showDocumentType,
  showKeywords,
  showMetrics,
  isContentBased,
  baseUnit,
  isStreamgraph,
  showBacklink,
  isInStreamBacklink,
  // event handlers
  handleBacklinkClick,
}) => {
  const loc = useLocalizationContext();

  const id = paper.safe_id;
  const access = {
    isOpenAccess: !!paper.oa,
    isFreeAccess: !!paper.free_access,
    isDataset: paper.resulttype === "dataset",
  };
  const tags = getPaperTags(paper);
  const link = getPaperTextLink(paper, linkType);
  const documentType = showDocumentType ? paper.resulttype : null;
  const comments = getPaperComments(paper);
  const keywords = showKeywords ? getPaperKeywords(paper, loc) : null;
  const metrics = showMetrics
    ? {
        tweets: paper.cited_by_tweeters_count,
        readers: paper["readers.mendeley"],
        citations: paper.citation_count,
        baseUnit: !isContentBased ? baseUnit : null,
      }
    : null;
  const backlink = {
    show: showBacklink,
    isInStream: isInStreamBacklink,
    onClick: () => handleBacklinkClick(),
  };

  const citations = paper.num_readers;
  const showCitations =
    !isContentBased &&
    !!baseUnit &&
    !showMetrics &&
    (!!citations || parseInt(citations) === 0);

  return (
    // html template starts here
    <ListEntry anchorId={id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={access.isOpenAccess}
          isFreeAccess={access.isFreeAccess}
          isDataset={access.isDataset}
          tags={tags ? <Tags values={tags} /> : null}
        />
        <Title paper={paper} />
        <Details authors={paper.authors_list} source={paper.published_in} />
        <Link address={link.address} isDoi={link.isDoi} />
      </div>
      {!!documentType && <DocumentType type={documentType} />}
      <Abstract text={paper.paper_abstract} />
      {!!comments && <Comments items={comments} />}
      {!!keywords && <Keywords>{keywords}</Keywords>}
      {!!metrics && (
        <Metrics
          citations={metrics.citations}
          tweets={metrics.tweets}
          readers={metrics.readers}
          baseUnit={metrics.baseUnit}
        />
      )}
      <PaperButtons paper={paper} />
      {!isStreamgraph && <Area paper={paper} isShort={showCitations} />}
      {showCitations && <Citations number={citations} label={baseUnit} />}
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
  linkType: state.list.linkType,
  showDocumentType: state.list.showDocumentType,
  showMetrics: state.list.showMetrics,
  isContentBased: state.list.isContentBased,
  baseUnit: state.list.baseUnit,
  showKeywords:
    state.list.showKeywords &&
    (!!state.selectedPaper || !state.list.hideUnselectedKeywords),
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(StandardListEntry);
