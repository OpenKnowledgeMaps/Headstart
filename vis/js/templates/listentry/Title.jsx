import React from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import { getDateFromTimestamp } from "../../utils/dates";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import useMatomo from "../../utils/useMatomo";

const MAX_TITLE_LENGTH = 150;

const Title = ({
  paper,
  isStreamgraph,
  disableClicks,
  isSelected,
  handleSelectPaper,
  handleSelectPaperWithZoom,
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    if (disableClicks) {
      return;
    }

    if (!isStreamgraph) {
      handleSelectPaperWithZoom(paper);
    } else {
      handleSelectPaper(paper);
    }

    trackEvent("List document", "Select paper", "List title");
  };

  const rawTitle = paper.title ? paper.title : loc.default_paper_title;

  const formattedDate = ` (${formatDate(paper.year)})`;
  const formattedTitle = isSelected
    ? rawTitle
    : formatTitle(rawTitle, MAX_TITLE_LENGTH - formattedDate.length);

  return (
    // html template starts here
    <div className="list_title" onClick={handleClick}>
      <a id="paper_list_title" title={rawTitle + formattedDate}>
        <Highlight queryHighlight>{formattedTitle}</Highlight>
        {!!paper.year && <Highlight queryHighlight>{formattedDate}</Highlight>}
      </a>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  disableClicks: state.list.disableClicks,
  isSelected: !!state.selectedPaper,
});

export default connect(mapStateToProps, mapDispatchToListEntriesProps)(Title);

const formatDate = (date) => {
  const strDate = date.toString();
  let format = "yyyy-mm-dd";
  if (strDate.match(/^\d{4}(-\d{2})?$/)) {
    format = "yyyy";
  }

  const formatted = getDateFromTimestamp(date, format);
  if (!formatted) {
    return strDate;
  }

  return formatted;
};

const formatTitle = (title, maxLength) => {
  const ellipsis = "...";
  if (title.length > maxLength) {
    return title.substr(0, maxLength - ellipsis.length).trim() + ellipsis;
  }

  return title;
};
