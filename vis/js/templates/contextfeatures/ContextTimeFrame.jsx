import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import useMatomo from "../../utils/useMatomo";

import HoverPopover from "../HoverPopover";



const ContextTimeFrame = ({ timespan, popoverContainer, modifier, isStreamgraph }) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackMouseEnter = () =>
    trackEvent("Title & Context line", "Hover most relevant", "Context line");

  if (modifier === "most-relevant") {
    return (
        <>
          {isStreamgraph
        ?<span onMouseEnter={trackMouseEnter}>
        <HoverPopover
          id="modifier-popover"
          container={popoverContainer}
          content={localization.time_frame_context_sg}
        >
          <span id="modifier" className="modifier context_moreinfo">
            {timespan}
          </span>
        </HoverPopover>{" "}
      </span>
          : <>{timespan}</>}
        </>
    );
  }

  return null;
};

const mapStateToProps = (state) => ({
  modifier: state.contextLine.modifier,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(ContextTimeFrame);
