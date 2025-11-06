import { FC } from "react";
import { connect } from "react-redux";

import { GEOMAP_MODE, STREAMGRAPH_MODE } from "../../reducers/chartType";
import {
  AllPossiblePapersType,
  ServiceType,
  SortValuesType,
  State,
} from "../../types";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Citations from "./Citations";
import Comments from "./Comments";
import Details from "./Details";
import DocTypesRow from "./DocTypesRow";
import DocumentType from "./DocumentType";
import EntryBacklink from "./EntryBacklink";
import Keywords from "./Keywords";
import Link from "./Link";
import { Location } from "./Location";
import Metrics from "./Metrics";
import OrcidMetrics from "./OrcidMetrics";
import PaperButtons from "./PaperButtons";
import Title from "./Title";

interface StandardListEntryProps {
  showDocumentType: boolean;
  showMetrics?: unknown;
  showAllDocTypes: boolean;
  showBackLink: boolean;
  showDocTags: boolean;
  showKeywords: boolean;
  showLocation: boolean;
  showAuthors: boolean;
  showArea: boolean;
  service: ServiceType;
  paper: AllPossiblePapersType;
  isContentBased: boolean;
  isInStreamBackLink: boolean;
  baseUnit: SortValuesType;
  handleBackLinkClick: () => void;
}

const getLocationFromPaper = (paper: AllPossiblePapersType): string | null => {
  if ("geographicalData" in paper && paper.geographicalData) {
    return paper.geographicalData.country;
  }

  return null;
};

const StandardListEntry: FC<StandardListEntryProps> = ({
  paper,
  showDocumentType,
  showKeywords,
  showLocation,
  showAuthors,
  showArea,
  showMetrics,
  isContentBased,
  baseUnit,
  showBackLink,
  isInStreamBackLink,
  showDocTags,
  showAllDocTypes,
  service,
  handleBackLinkClick,
}) => {
  const citations = paper.citation_count;
  const showCitations =
    !isContentBased &&
    !!baseUnit &&
    !showMetrics &&
    (!!citations || parseInt(citations as unknown as string) === 0);

  const location = getLocationFromPaper(paper);

  return (
    <div id="list_holder" className="resulttype-paper">
      <div className="list_entry">
        <a className="list_anchor" id={paper.safe_id}></a>
        <div className="list_metadata">
          <AccessIcons paper={paper} showDocTypes={showDocTags} />
          <Title paper={paper} />
          {showAuthors && (
            <Details authors={paper.authors_list} source={paper.published_in} />
          )}
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
        {showLocation && <Location>{location}</Location>}
        {showKeywords && <Keywords>{paper.keywords}</Keywords>}

        {showAllDocTypes && <DocTypesRow types={paper.resulttype} />}

        {service !== "orcid" && showMetrics ? (
          <Metrics
            citations={paper.citation_count}
            // @ts-ignore
            tweets={paper.cited_by_tweeters_count}
            // @ts-ignore
            readers={paper["readers.mendeley"]}
            baseUnit={!isContentBased ? baseUnit : null}
          />
        ) : null}

        {service === "orcid" && showMetrics ? (
          <OrcidMetrics
            citations={paper.citation_count}
            social_media={paper.social}
            references_outside_academia={paper.references}
            baseUnit={!isContentBased ? baseUnit : null}
          />
        ) : null}

        {showCitations && <Citations number={citations} label={baseUnit} />}
        <PaperButtons paper={paper} />
        {showArea && <Area paper={paper} isShort={showCitations} />}
        {showBackLink && (
          <EntryBacklink
            onClick={handleBackLinkClick}
            isInStream={isInStreamBackLink}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  showDocumentType: state.list.showDocumentType,
  showMetrics: state.list.showMetrics,
  isContentBased: state.list.isContentBased,
  baseUnit: state.list.baseUnit,
  showLocation: state.chartType === GEOMAP_MODE && Boolean(state.selectedPaper),
  showKeywords:
    state.list.showKeywords &&
    (!!state.selectedPaper || !state.list.hideUnselectedKeywords),
  showBackLink:
    (state.chartType === STREAMGRAPH_MODE || state.chartType === GEOMAP_MODE) &&
    !!state.selectedPaper,
  isInStreamBackLink: !!state.selectedBubble,
  showDocTags: state.service === "base" || state.service === "orcid",
  showAllDocTypes:
    (state.service === "base" ||
      state.service === "orcid" ||
      state.service === "aquanavi") &&
    !!state.selectedPaper,
  service: state.service,
  showAuthors: state.chartType !== GEOMAP_MODE,
  showArea:
    state.chartType !== STREAMGRAPH_MODE && state.chartType !== GEOMAP_MODE,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps,
)(StandardListEntry);
