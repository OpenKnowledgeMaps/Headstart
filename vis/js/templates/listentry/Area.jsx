import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import useMatomo from "../../utils/useMatomo";

const Area = ({
  paper,
  isShort = false,
  trackMouseOver,
  disableClicks,
  handleZoomIn,
  handleAreaMouseover,
  handleAreaMouseout,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleMouseOver = () => {
    handleAreaMouseover(paper);
    if (trackMouseOver) {
      trackEvent("List document", "Hover bubble", "Area name");
    }
  };

  const handleClick = () => {
    if (disableClicks) {
      return;
    }
    handleZoomIn(paper);
    trackEvent("List document", "Zoom in", "Area name");
  };

  return (
    // html template starts here
    <div
      className={"list_row list_area" + (isShort ? " short" : "")}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleAreaMouseout}
    >
      <span className="list_row_label">{localization.area}: </span>
      <span className="area_name" title={paper.area}>
        {paper.area}
      </span>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  trackMouseOver: state.tracking.trackMouseOver,
  disableClicks: state.list.disableClicks,
});

export default connect(mapStateToProps, mapDispatchToListEntriesProps)(Area);
