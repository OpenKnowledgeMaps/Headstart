// @ts-nocheck
import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import useMatomo from "../../utils/useMatomo";

import HoverPopover from "../HoverPopover";



const ContextTimeFrame = ({timespan, popoverContainer, isStreamgraph}) => {
  const localization = useLocalizationContext();
  const {trackEvent} = useMatomo();

  const trackMouseEnter = () =>
      trackEvent("Title & Context line", "Hover time frame", "Context line");

  return (
      <>
        {isStreamgraph
            ? <span onMouseEnter={trackMouseEnter}>
              <HoverPopover
                  id="context-timeframe-popover"
                  container={popoverContainer}
                  content={localization.time_frame_context_sg}>
                <span id="time-frame-data" className="modifier context_moreinfo">
                  {timespan}
                </span>
              </HoverPopover>{" "}
            </span>
            : timespan}
      </>
  );

};

const mapStateToProps = (state) => ({
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(ContextTimeFrame);
