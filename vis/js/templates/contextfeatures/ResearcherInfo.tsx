// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openResearcherModal } from "../../actions";

const ResearcherInfo = ({ onClick }: {
  onClick: () => void;
}) => {
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
      id="researcher-link"
      className="context_item"
      title={loc.researcher_details_label}
    >
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-user"></i> {loc.researcher_details_label}
      </span>
    </span>

    // html template ends here
  );
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openResearcherModal()),
});

export default connect(null, mapDispatchToProps)(ResearcherInfo);
