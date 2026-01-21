import React, { FC, ReactNode } from "react";
import { connect } from "react-redux";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import useMatomo from "../../utils/useMatomo";
import HoverPopover from "../HoverPopover";

interface ContextTimeFrameProps {
  time: string;
  popoverContainer: ReactNode;
  isStreamgraph: boolean;
}

const ContextTimeFrame: FC<ContextTimeFrameProps> = ({
  time,
  popoverContainer,
  isStreamgraph,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackMouseEnter = () =>
    trackEvent("Title & Context line", "Hover time frame", "Context line");

  return (
    <>
      {isStreamgraph ? (
        <span onMouseEnter={trackMouseEnter}>
          <HoverPopover
            id="context-timeframe-popover"
            container={popoverContainer}
            content={localization.time_frame_context_sg}
          >
            <span id="time-frame-data" className="modifier context_moreinfo">
              {time}
            </span>
          </HoverPopover>{" "}
        </span>
      ) : (
        time
      )}
    </>
  );
};

const mapStateToProps = (state: any) => ({
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(ContextTimeFrame);
