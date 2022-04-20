import React from "react";
import { connect } from "react-redux";

import { toggleList } from "../actions";
import { useLocalizationContext } from "../components/LocalizationProvider";
import useMatomo from "../utils/useMatomo";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

const ListToggle = ({
  docsNumber,
  isShown,
  isZoomed,
  isStreamgraph,
  appliedFilter,
  onClick,
}) => {
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();
    if (isShown) {
      trackEvent("List controls", "Hide list", "List toggle");
    } else {
      trackEvent("List controls", "Show list", "List toggle");
    }
  };

  const loc = useLocalizationContext();
  // this should later move to localization
  let mainLabel = "Overview";
  if (isZoomed) {
    mainLabel = isStreamgraph ? loc.area_streamgraph : loc.area;
  }

  let docsLabel = "document";
  switch (appliedFilter) {
    case "open_access":
      docsLabel = "open access document";
      break;
    case "dataset":
      docsLabel = "dataset";
      break;
    default:
      break;
  }

  if (docsNumber > 1) {
    docsLabel += "s";
  }

  return (
    // html template starts here
    <div id="show_hide_button" className="row" onClick={handleClick}>
      <div className="col-xs-2">
        <i className="fas fa-chevron-down chevron"></i>
      </div>
      <div className="col-xs-8" id="show_hide_button_label">
        <span id="show_hide_label">
          <span>
            {mainLabel}{" "}
            <span id="list_item_banner">
              (<span id="list_item_count">{docsNumber}</span> {docsLabel})
            </span>
          </span>
        </span>
      </div>
      <div className="col-xs-2 text-right">
        <i className="fas fa-chevron-down chevron"></i>
      </div>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isShown: state.list.show,
  isZoomed: state.zoom,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  appliedFilter: state.list.filterValue,
});

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(toggleList()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListToggle);
