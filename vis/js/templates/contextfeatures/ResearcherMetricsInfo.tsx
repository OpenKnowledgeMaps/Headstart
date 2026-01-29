import React, { FC } from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openResearcherMetricsModal } from "../../actions";

interface ResearcherMetricsInfoProps {
  onClick: () => void;
}

const ResearcherMetricsInfo: FC<ResearcherMetricsInfoProps> = ({ onClick }) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();

    trackEvent(
      "Title & Context line",
      "Open researcher metrics modal",
      "More researcher metrics info button"
    );
  };

  return (
    <span id="researcher-metrics-link" className="context_item" title="Metrics">
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-chart-line"></i> {loc.metrics_label}
      </span>
    </span>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  onClick: () => dispatch(openResearcherMetricsModal()),
});

export default connect(null, mapDispatchToProps)(ResearcherMetricsInfo);
