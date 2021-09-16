import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";

import HoverPopover from "../HoverPopover";

const Modifier = ({ popoverContainer, modifier, isStreamgraph }) => {
  const localization = useLocalizationContext();

  if (modifier === "most-recent") {
    return (
      <>
        <span id="modifier" className="modifier">
          {localization.most_recent_label}
        </span>{" "}
      </>
    );
  }

  if (modifier === "most-relevant") {
    return (
      <>
        <HoverPopover
          id="modifier-popover"
          container={popoverContainer}
          content={
            isStreamgraph
              ? localization.most_relevant_tooltip_sg
              : localization.most_relevant_tooltip
          }
        >
          <span id="modifier" className="modifier context_moreinfo">
            {localization.most_relevant_label}
          </span>
        </HoverPopover>{" "}
      </>
    );
  }

  return null;
};

const mapStateToProps = (state) => ({
  modifier: state.contextLine.modifier,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(Modifier);
