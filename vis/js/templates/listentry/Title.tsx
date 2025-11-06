import { FC } from "react";
import { connect } from "react-redux";

import { useVisualizationType } from "@/hooks";

import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { AllPossiblePapersType, State } from "../../types";
import { getDateFromTimestamp } from "../../utils/dates";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import useMatomo from "../../utils/useMatomo";

const MAX_TITLE_LENGTH = 164;

interface TitleProps {
  disableClicks: boolean;
  isSelected: boolean;
  paper: AllPossiblePapersType;
  handleSelectPaper: (paper: AllPossiblePapersType) => void;
  handleSelectPaperWithZoom: (paper: AllPossiblePapersType) => void;
  handleMouseEnterOnTitle: (id: string | null) => void;
}

const Title: FC<TitleProps> = ({
  paper,
  disableClicks,
  isSelected,
  handleSelectPaper,
  handleSelectPaperWithZoom,
  handleMouseEnterOnTitle,
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();
  const { isGeoMap, isKnowledgeMap, isStreamgraph } = useVisualizationType();

  const handleClick = () => {
    if (disableClicks) {
      return;
    }

    if (isGeoMap || isStreamgraph) {
      handleSelectPaper(paper);
    }

    if (isKnowledgeMap) {
      handleSelectPaperWithZoom(paper);
    }

    trackEvent("List document", "Select paper", "List title");
  };

  const handleMouseEnter = () => {
    handleMouseEnterOnTitle(paper.safe_id);
  };

  const handleMouseLeave = () => {
    handleMouseEnterOnTitle(null);
  };

  const mouseEnterHandler = isGeoMap ? handleMouseEnter : undefined;
  const mouseLeaveHandler = isGeoMap ? handleMouseLeave : undefined;

  const rawTitle = paper.title ? paper.title : loc.default_paper_title;

  const formattedDate = ` (${formatPaperDate(paper.year)})`;
  const formattedTitle = isSelected
    ? rawTitle
    : formatTitle(rawTitle, MAX_TITLE_LENGTH - formattedDate.length);

  return (
    <div
      className="list_title"
      onClick={handleClick}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <a id="paper_list_title" title={rawTitle + (paper.year ? formattedDate : "")}>
        <Highlight queryHighlight>{formattedTitle}</Highlight>
        {!!paper.year && <Highlight queryHighlight>{formattedDate}</Highlight>}
      </a>
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  disableClicks: state.list.disableClicks,
  isSelected: !!state.selectedPaper,
});

export default connect(mapStateToProps, mapDispatchToListEntriesProps)(Title);

export const formatPaperDate = (date?: string) => {
  if (!date) {
    return "";
  }
  const strDate = date.toString();
  let format = "yyyy-mm-dd";
  if (strDate.match(/^\d{4}(-\d{2})?$/)) {
    format = "yyyy";
  }

  const formatted = getDateFromTimestamp(date, { format, inUTC: true });
  if (!formatted) {
    return strDate;
  }

  return formatted;
};

const formatTitle = (title: string, maxLength: number) => {
  const ellipsis = "...";
  if (title.length > maxLength) {
    return title.substr(0, maxLength - ellipsis.length).trim() + ellipsis;
  }

  return title;
};
