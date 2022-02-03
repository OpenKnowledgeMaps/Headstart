import React from "react";
import { connect } from "react-redux";

import { STREAMGRAPH_MODE } from "../../reducers/chartType";
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
    <div id="list_holder" className="resulttype-paper">
      <div className="list_entry">
        <a className="list_anchor" id={paper.safe_id}></a>
        <div className="list_metadata">
          <AccessIcons
            isOpenAccess={!!paper.oa}
            isFreeAccess={!!paper.free_access}
            isDataset={paper.resulttype.includes("dataset")}
            tags={paper.tags.length > 0 ? <Tags values={paper.tags} /> : null}
          />
          <Title paper={paper} />
          <Details authors={paper.authors_list} source={paper.published_in} />
          <Link
            address={paper.list_link.address}
            isDoi={paper.list_link.isDoi}
          />
        </div>
        {showDocumentType && paper.resulttype.length > 0 && (
          <DocumentType type={paper.resulttype[0]} />
        )}
        <Abstract text={paper.paper_abstract} />
        {paper.comments.length > 0 && <Comments items={paper.comments} />}
        {showKeywords && <Keywords>{paper.keywords}</Keywords>}
        {showMetrics && (
          <Metrics
            citations={paper.citation_count}
            tweets={paper.cited_by_tweeters_count}
            readers={paper["readers.mendeley"]}
            baseUnit={!isContentBased ? baseUnit : null}
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
      </div>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
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
