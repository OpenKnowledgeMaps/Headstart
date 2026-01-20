import React, { FC } from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openResearcherModal } from "../../actions";

interface ResearcherInfoProps {
  onClick: () => void;
}

const ResearcherInfo: FC<ResearcherInfoProps> = ({ onClick }) => {
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
    <span
      id="researcher-link"
      className="context_item"
      title={loc.researcher_details_label}
    >
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-user"></i> {loc.researcher_details_label}
      </span>
    </span>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  onClick: () => dispatch(openResearcherModal()),
});

export default connect(null, mapDispatchToProps)(ResearcherInfo);
