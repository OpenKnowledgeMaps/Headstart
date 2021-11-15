import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openInfoModal } from "../../actions";

const MoreInfoLink = ({ onClick }) => {
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
    <span id="more-info-link" className="context_item">
      <button onClick={handleClick} className="context_moreinfo">
        {loc.intro_label}
      </button>
    </span>

    // html template ends here
  );
};

const mapDispatchToProps = (dispatch) => ({
  onClick: () => dispatch(openInfoModal()),
});

export default connect(null, mapDispatchToProps)(MoreInfoLink);
