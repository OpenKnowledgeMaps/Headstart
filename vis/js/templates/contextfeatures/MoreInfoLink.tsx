import React, { FC } from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { openInfoModal } from "../../actions";

interface MoreInfoLinkProps {
  onClick: () => void;
}

const MoreInfoLink: FC<MoreInfoLinkProps> = ({ onClick }) => {
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
    <span
      id="more-info-link"
      className="context_item"
      title="More information about the visualization"
    >
      <span onClick={handleClick} className="context_moreinfo infolink">
        <i className="fas fa-info-circle"></i> {loc.intro_label}
      </span>
    </span>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  onClick: () => dispatch(openInfoModal()),
});

export default connect(null, mapDispatchToProps)(MoreInfoLink);
