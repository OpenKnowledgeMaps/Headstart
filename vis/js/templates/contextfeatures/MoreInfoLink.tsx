// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openInfoModal } from "../../actions";

const MoreInfoLink = ({ onClick }: {
  onClick: () => void;
}) => {
  const loc = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    onClick();

    trackEvent(
      "Title & Context line",
      "Open more info modal",
      "More info button"
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
        <i className="fas fa-info-circle"></i> {loc.intro_label}
      </span>
    </span>

    // html template ends here
  );
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openInfoModal()),
});

export default connect(null, mapDispatchToProps)(MoreInfoLink);
