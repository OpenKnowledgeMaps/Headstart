import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openResearcherModal } from "../../actions";

const ResearcherInfo = ({ onClick }) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();

    trackEvent(
      "Title & Context line",
      "Open researcher modal",
      "More researcher info button"
    );
  };

  return (
    // html template starts here
    <span
      id="more-info-link"
      className="context_item"
      title="More information about the visualization"
    >
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-chart-line"></i> {loc.metrics_label}
      </span>
    </span>

    // html template ends here
  );
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openResearcherModal()),
});

export default connect(null, mapDispatchToProps)(ResearcherInfo);
