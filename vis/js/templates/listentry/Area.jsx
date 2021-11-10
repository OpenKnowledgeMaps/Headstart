import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

const Area = ({
  children,
  onClick,
  onMouseOver,
  onMouseOut,
  trackMouseOver,
}) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const handleMouseOver = () => {
    onMouseOver();
    if (trackMouseOver) {
      trackEvent("List document", "Hover bubble", "Area name");
    }
  };

  const handleClick = () => {
    onClick();
    trackEvent("List document", "Zoom in", "Area name");
  };

  return (
    // html template starts here
    <div
      id="list_area"
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={onMouseOut}
    >
      <span className="area_tag">{localization.area}:</span>{" "}
      <span className="area_name">{children}</span>
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  trackMouseOver: state.tracking.trackMouseOver,
});

export default connect(mapStateToProps)(Area);
