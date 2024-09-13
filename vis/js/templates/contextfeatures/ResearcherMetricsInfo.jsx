import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openResearcherMetricsModal } from "../../actions";

const ResearcherMetricsInfo = ({ onClick }) => {
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
    // html template starts here
    <span
      id="researcher-metrics-link"
      className="context_item"
      title="Metrics"
    >
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-chart-line"></i> {loc.metrics_label}
      </span>
    </span>

    // html template ends here
  );
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openResearcherMetricsModal()),
});

export default connect(null, mapDispatchToProps)(ResearcherMetricsInfo);
